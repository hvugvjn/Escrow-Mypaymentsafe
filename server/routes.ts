import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { isAuthenticated } from "./auth";
import { setupAuth, registerAuthRoutes } from "./auth";
import {
  sendProjectCreatedEmail,
  sendEscrowFundedEmail,
  sendWorkSubmittedEmail,
  sendPaymentReleasedEmail
} from "./email";
import multer from "multer";
import path from "path";
import fs from "fs";

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

  app.post("/api/upload", isAuthenticated, upload.single("document"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    res.json({ url: `/uploads/${req.file.filename}` });
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

    res.json({ project, milestones, escrow, buyerName, freelancerName });
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

      const project = await storage.createProject({
        ...input,
        projectCode,
        createdBy: userId,
        status: 'WAITING_FOR_ACCEPTANCE',
        expiresAt,
        buyerId: user?.role === 'BUYER' ? userId : null,
        freelancerId: user?.role === 'FREELANCER' ? userId : null,
      });

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

  return httpServer;
}
