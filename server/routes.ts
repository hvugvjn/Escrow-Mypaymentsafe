import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { isAuthenticated } from "./auth";
import { setupAuth, registerAuthRoutes } from "./auth";
import { registerAdminRoutes } from "./admin";
import {
  sendProjectCreatedEmail,
  sendEscrowFundedEmail,
  sendWorkSubmittedEmail,
  sendPaymentReleasedEmail
} from "./email";
import { createMilestonePaymentLink, createPlatformFeeLink, verifyCashfreeWebhook } from "./cashfree";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storageEngine = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storageEngine });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Set up Replit Auth
  await setupAuth(app);
  registerAuthRoutes(app);
  registerAdminRoutes(app);

  app.post("/api/upload", isAuthenticated, upload.single("document"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    res.json({ url: `/uploads/${req.file.filename}` });
  });

  app.get("/api/freelancers", isAuthenticated, async (req: any, res) => {
    try {
      const search = req.query.search as string || "";
      const freelancers = await storage.searchFreelancers(search);
      // Remove sensitive data before sending
      const safeFreelancers = freelancers.map(f => {
        const { password, ...rest } = f as any;
        return rest;
      });
      res.json(safeFreelancers);
    } catch (err) {
      res.status(500).json({ message: "Failed to search freelancers" });
    }
  });

  // Profile update
  app.put(api.profile.update.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.profile.update.input.parse(req.body);
      const userId = req.user.claims.sub;
      const user = await storage.updateUser(userId, { ...input, profileCompleted: true });
      res.status(200).json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal error" });
    }
  });

  // Projects
  app.get(api.projects.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const projects = await storage.getUserProjects(userId);
    res.json(projects);
  });

  app.get(api.projects.get.path, isAuthenticated, async (req: any, res) => {
    const project = await storage.getProject(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const userId = req.user.claims.sub;
    if (project.createdBy !== userId && project.buyerId !== userId && project.freelancerId !== userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const milestones = await storage.getMilestones(project.id);
    const escrow = await storage.getEscrow(project.id);

    let buyerName = 'Awaiting Buyer';
    let freelancerName = 'Awaiting Freelancer';

    if (project.buyerId) {
      const buyer = await storage.getUser(project.buyerId);
      if (buyer) {
        buyerName =
          (buyer.companyName && buyer.companyName.trim()) ||
          [buyer.firstName, buyer.lastName].filter(Boolean).join(' ') ||
          (buyer.email ? buyer.email.split('@')[0] : '') ||
          'Company';
      }
    }
    if (project.freelancerId) {
      const freelancer = await storage.getUser(project.freelancerId);
      if (freelancer) {
        freelancerName =
          [freelancer.firstName, freelancer.lastName].filter(Boolean).join(' ') ||
          (freelancer.email ? freelancer.email.split('@')[0] : '') ||
          'Freelancer';
      }
    }

    res.json({ project, milestones, escrow, clientName: buyerName, talentName: freelancerName });
  });

  app.get(api.projects.getByCode.path, isAuthenticated, async (req: any, res) => {
    const project = await storage.getProjectByCode(req.params.code);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const milestones = await storage.getMilestones(project.id);
    res.json({ project, milestones });
  });

  app.post(api.projects.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.projects.create.input.parse(req.body);
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      const projectCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

      const isExport = req.body.tradeType === 'export';
      const project = await storage.createProject({
        ...input,
        projectCode,
        createdBy: userId,
        status: 'WAITING_FOR_ACCEPTANCE',
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        currency: input.currency || 'USD',
        buyerId: isExport ? null : userId,
        freelancerId: isExport ? userId : ((input as any).freelancerId || null),
      } as any);

      if (user?.email) {
        sendProjectCreatedEmail(user.email, project.title, projectCode).catch(console.error);
      }

      res.status(201).json(project);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal error" });
    }
  });

  app.post(api.projects.join.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.projects.join.input.parse(req.body);
      const project = await storage.getProjectByCode(input.projectCode);
      if (!project) return res.status(404).json({ message: 'Project not found' });

      if (project.expiresAt < new Date()) {
        await storage.updateProjectStatus(project.id, 'CANCELLED');
        return res.status(400).json({ message: 'Project code expired' });
      }

      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) return res.status(401).json({ message: 'Unauthorized' });

      if (project.createdBy === userId) {
        return res.status(400).json({ message: 'Cannot join your own project' });
      }

      const updatedProject = await storage.joinProject(project.id, userId, user.role || 'FREELANCER');

      // Calculate total escrow needed
      const milestones = await storage.getMilestones(project.id);
      const totalAmount = milestones.reduce((sum, m) => sum + m.amount, 0);

      // Create escrow
      if (totalAmount > 0) {
        await storage.createEscrow({
          projectId: project.id,
          totalAmount,
          remainingAmount: totalAmount,
        });
      }

      res.json(updatedProject);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal error" });
    }
  });

  app.post(api.projects.fund.path, isAuthenticated, async (req: any, res) => {
    const project = await storage.getProject(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const userId = req.user.claims.sub;
    if (project.buyerId !== userId) return res.status(403).json({ message: 'Only buyer can fund' });

    const escrow = await storage.getEscrow(project.id);
    if (!escrow) return res.status(404).json({ message: 'Escrow not found' });

    const updatedEscrow = await storage.updateEscrow(escrow.id, {
      funded: true,
      fundedAt: new Date(),
    });

    await storage.updateProjectStatus(project.id, 'ACTIVE');

    if (project.freelancerId) {
      const freelancer = await storage.getUser(project.freelancerId);
      if (freelancer?.email) {
        sendEscrowFundedEmail(freelancer.email, project.title, escrow.totalAmount).catch(console.error);
      }
    }

    res.json(updatedEscrow);
  });

  app.post(api.milestones.create.path, isAuthenticated, async (req: any, res) => {
    try {
      // Extend schema to accept date string and amount numeric string
      const bodySchema = api.milestones.create.input.extend({
        amount: z.coerce.number(),
        deadline: z.coerce.date()
      });
      const input = bodySchema.parse(req.body);
      const milestone = await storage.createMilestone({
        ...input,
        projectId: req.params.projectId
      });
      res.status(201).json(milestone);
    } catch (err) {
      res.status(400).json({ message: "Validation failed" });
    }
  });

  app.post(api.milestones.submit.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.milestones.submit.input.parse(req.body);
      const milestone = await storage.updateMilestone(req.params.id, {
        status: 'SUBMITTED',
        submissionUrl: input.submissionUrl
      });
      await storage.updateProjectStatus(milestone.projectId, 'UNDER_REVIEW');

      const project = await storage.getProject(milestone.projectId);
      if (project?.buyerId) {
        const buyer = await storage.getUser(project.buyerId);
        if (buyer?.email) {
          sendWorkSubmittedEmail(buyer.email, project.title, milestone.title).catch(console.error);
        }
      }

      res.json(milestone);
    } catch (err) {
      res.status(400).json({ message: "Validation failed" });
    }
  });

  // ── CREATE CASHFREE PAYMENT LINK (replaces dummy Fund Escrow) ─────────────
  // Called when client clicks "Approve & Pay" on a submitted milestone
  app.post('/api/milestones/:id/payment-link', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const milestoneId = req.params.id;


      const allMs = await storage.getMilestones(req.body.projectId || '');
      const ms = allMs.find(m => m.id === milestoneId);
      if (!ms) return res.status(404).json({ message: 'Milestone not found' });
      if (ms.status !== 'SUBMITTED') return res.status(400).json({ message: 'Milestone must be in SUBMITTED state' });

      const project = await storage.getProject(ms.projectId);
      if (!project) return res.status(404).json({ message: 'Project not found' });
      if (project.buyerId !== userId) return res.status(403).json({ message: 'Only the client can approve payment' });

      const user = await storage.getUser(userId);
      if (!user) return res.status(401).json({ message: 'Unauthorized' });

      const clientName  = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || 'Client';
      const clientPhone = user.phone?.replace(/\D/g, '').slice(-10) || '9999999999';
      const returnUrl   = `${process.env.SITE_URL || 'https://paxdot.com'}/projects/${project.id}?payment=done`;

      // Amount: milestones store in cents → convert to paise (same unit for INR)
      const paymentLink = await createMilestonePaymentLink({
        milestoneId:    ms.id,
        projectTitle:   project.title,
        milestoneTitle: ms.title,
        amountInPaise:  ms.amount, // stored as cents, works as paise for INR
        clientName,
        clientEmail:    user.email || '',
        clientPhone,
        returnUrl,
      });

      // Mark milestone as PAYMENT_PENDING so UI can show correct state
      await storage.updateMilestone(ms.id, { status: 'PAYMENT_PENDING' });

      res.json({
        paymentSessionId: paymentLink.payment_session_id,
        orderId:          paymentLink.order_id,
        paymentUrl:       paymentLink.link_url,
        amount:           ms.amount,
        milestone:        ms.title,
      });
    } catch (err: any) {
      console.error('[PAYMENT LINK ERROR]', err);
      res.status(500).json({ message: err?.message || 'Failed to create payment link' });
    }
  });

  // ── CASHFREE WEBHOOK — Auto-releases milestone when payment confirmed ───────
  // Register BEFORE body-parser so we can read raw body for signature verification
  app.post('/api/webhooks/cashfree',
    express.raw({ type: 'application/json' }),
    async (req, res) => {
      try {
        const rawBody  = req.body?.toString() || '';
        const timestamp = req.headers['x-webhook-timestamp'] as string || '';
        const signature = req.headers['x-webhook-signature'] as string || '';

        // Verify webhook authenticity
        const isValid = verifyCashfreeWebhook(rawBody, timestamp, signature);
        if (!isValid) {
          console.warn('[WEBHOOK] ❌ Invalid Cashfree webhook signature');
          return res.status(400).json({ message: 'Invalid signature' });
        }

        const event = JSON.parse(rawBody);
        console.log('[WEBHOOK] Cashfree event received:', event?.type);

        // Handle successful payment
        if (event?.type === 'PAYMENT_SUCCESS_WEBHOOK' || event?.data?.payment?.payment_status === 'SUCCESS') {
          const linkId    = event?.data?.link?.link_id || event?.data?.order?.order_id || '';
          const linkMeta  = event?.data?.link?.link_meta || {};
          const orderTags = event?.data?.order?.order_tags || {};
          const milestoneId = linkMeta?.milestone_id || orderTags?.milestone_id;

          if (milestoneId) {
            // Get milestone and mark as FUNDED (Escrow secured)
            const updated = await storage.updateMilestone(milestoneId, { status: 'FUNDED' });

            // Ensure project status is ACTIVE
            if (updated) {
              await storage.updateProjectStatus(updated.projectId, 'ACTIVE');
              
              // Notify talent that escrow is secured
              await createNotification({
                userId: updated.freelancerId || '',
                type: 'SYSTEM',
                title: 'Escrow Secured',
                message: `Client has funded the escrow for milestone: ${updated.title}. You can now begin work.`,
                read: false,
              });
            }

            // Notify talent
            const project = await storage.getProject(updated.projectId);
            if (project?.freelancerId) {
              const talent = await storage.getUser(project.freelancerId);
              if (talent?.email) {
                sendPaymentReleasedEmail(talent.email, project.title, updated.amount).catch(console.error);
              }
            }

            console.log(`[WEBHOOK] ✅ Milestone ${milestoneId} marked RELEASED via Cashfree payment`);
          } else if (linkMeta?.is_fee === 'true') {
            const projectId = linkMeta.project_id;
            if (projectId) {
              await storage.updateProjectStatus(projectId, 'ACTIVE');
              console.log(`[WEBHOOK] ✅ Platform fee paid for project ${projectId}. Marked as ACTIVE.`);
            }
          } else {
            console.log('[WEBHOOK] Payment received but no milestone_id or is_fee in meta. Link ID:', linkId);
          }
        }

        res.status(200).json({ received: true });
      } catch (err) {
        console.error('[WEBHOOK] Error processing Cashfree webhook:', err);
        res.status(500).json({ message: 'Webhook processing error' });
      }
    }
  );

  // ── APPROVE WORK & RELEASE PAYOUT ──────────────────────────────────────────
  app.post('/api/milestones/:id/approve', isAuthenticated, async (req: any, res) => {
    try {
      const milestoneId = req.params.id;
      const userId = req.user.claims.sub;
      
      const updated = await storage.updateMilestone(milestoneId, { status: 'RELEASED' });
      
      // Update escrow tracking
      const escrow = await storage.getEscrow(updated.projectId);
      if (escrow) {
        await storage.updateEscrow(escrow.id, {
          releasedAmount: escrow.releasedAmount + updated.amount,
          remainingAmount: Math.max(0, escrow.remainingAmount - updated.amount),
        });
      }

      // Check if all milestones done
      const allMs = await storage.getMilestones(updated.projectId);
      if (allMs.every(m => m.status === 'RELEASED')) {
        await storage.updateProjectStatus(updated.projectId, 'COMPLETED');
      }

      // Notify talent
      if (updated.freelancerId) {
        await createNotification({
          userId: updated.freelancerId,
          type: 'SYSTEM',
          title: 'Work Approved - Payout Released',
          message: `Your work for milestone '${updated.title}' has been approved. The payout is being processed to your bank account!`,
          read: false,
        });
      }

      // TODO: Trigger Cashfree Payouts API here to automatically route funds to the talent

      res.json(updated);
    } catch (err: any) {
      console.error('[APPROVE ERROR]', err);
      res.status(500).json({ message: err.message || 'Failed to approve work' });
    }
  });

  // ── ACTIVATE PROJECT (Free) ──────────────
  app.post('/api/projects/:id/activate', isAuthenticated, async (req: any, res) => {
    try {
      const userId  = req.user.claims.sub;
      const project = await storage.getProject(req.params.id);
      if (!project) return res.status(404).json({ message: 'Project not found' });
      if (project.buyerId !== userId && project.createdBy !== userId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      const updated = await storage.updateProjectStatus(project.id, 'ACTIVE');
      res.json(updated);
    } catch (err: any) {
      console.error('[ACTIVATE ERROR]', err);
      res.status(500).json({ message: err?.message || 'Failed to activate project' });
    }
  });

  // ── LEGACY APPROVE (kept for admin use — prefer /payment-link route) ───────
  app.post(api.milestones.approve.path, isAuthenticated, async (req: any, res) => {
    const milestone = await storage.updateMilestone(req.params.id, {
      status: 'RELEASED'
    });

    const escrow = await storage.getEscrow(milestone.projectId);
    if (escrow) {
      await storage.updateEscrow(escrow.id, {
        releasedAmount: escrow.releasedAmount + milestone.amount,
        remainingAmount: escrow.remainingAmount - milestone.amount,
      });
    }

    // Check if all milestones released
    const milestones = await storage.getMilestones(milestone.projectId);
    if (milestones.every(m => m.status === 'RELEASED')) {
      await storage.updateProjectStatus(milestone.projectId, 'COMPLETED');
    } else {
      await storage.updateProjectStatus(milestone.projectId, 'ACTIVE');
    }

    const project = await storage.getProject(milestone.projectId);
    if (project?.freelancerId) {
      const freelancer = await storage.getUser(project.freelancerId);
      if (freelancer?.email) {
        sendPaymentReleasedEmail(freelancer.email, project.title, milestone.amount).catch(console.error);
      }
    }

    res.json(milestone);
  });

  app.post(api.milestones.requestRevision.path, isAuthenticated, async (req: any, res) => {
    const milestone = await storage.updateMilestone(req.params.id, {
      status: 'REVISION_REQUESTED'
    });
    await storage.updateProjectStatus(milestone.projectId, 'ACTIVE');
    res.json(milestone);
  });

  app.post(api.disputes.raise.path, isAuthenticated, async (req: any, res) => {
    const project = await storage.updateProjectStatus(req.params.id, 'DISPUTED');
    res.json(project);
  });

  // ── Chat Routes ──────────────────────────────────────────
  app.get('/api/projects/:id/messages', isAuthenticated, async (req: any, res) => {
    const msgs = await storage.getMessages(req.params.id);
    res.json(msgs);
  });

  app.post('/api/projects/:id/messages', isAuthenticated, async (req: any, res) => {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: 'Message cannot be empty' });

    const userId = req.user.claims.sub;
    const user = await storage.getUser(userId);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const senderName =
      (user.companyName?.trim()) ||
      [user.firstName, user.lastName].filter(Boolean).join(' ') ||
      user.email?.split('@')[0] ||
      'User';

    const msg = await storage.createMessage({
      projectId: req.params.id,
      senderId: userId,
      senderName,
      senderRole: user.role || 'USER',
      content: content.trim(),
    });
    res.json(msg);
  });

  // ── Inbox / Direct Messaging Routes ──────────────────────────────────────────
  app.get('/api/chats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const chats = await storage.getDirectChats(userId);
      res.json(chats);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal error fetching chats" });
    }
  });

  app.post('/api/chats', isAuthenticated, async (req: any, res) => {
    try {
      const { freelancerId } = req.body;
      const userId = req.user.claims.sub; // buyerId
      const chat = await storage.getOrCreateDirectChat(userId, freelancerId);
      res.json(chat);
    } catch (err) {
      res.status(500).json({ message: "Internal error creating chat" });
    }
  });

  app.get('/api/chats/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const msgs = await storage.getDirectMessages(req.params.id);
      res.json(msgs);
    } catch (err) {
      res.status(500).json({ message: "Internal error fetching messages" });
    }
  });

  app.post('/api/chats/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const { content } = req.body;
      if (!content?.trim()) return res.status(400).json({ message: 'Message cannot be empty' });

      const userId = req.user.claims.sub;
      const msg = await storage.createDirectMessage({
        chatId: req.params.id,
        senderId: userId,
        content: content.trim(),
      });
      res.json(msg);
    } catch (err) {
      res.status(500).json({ message: "Internal error sending message" });
    }
  });

  return httpServer;
}
