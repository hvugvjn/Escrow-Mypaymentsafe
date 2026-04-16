import type { Express } from "express";
import { db } from "./db";
import { users, projects, milestones, escrows, messages } from "@shared/schema";
import { storage } from "./storage";
import { marketingService } from "./marketing-service";
import { desc, count, sum, eq } from "drizzle-orm";

const ADMIN_EMAIL = "info@paxdot.com"; // ← your admin Gmail

function isAdmin(req: any, res: any, next: any) {
  const sessionAny = req.session as any;
  if (!sessionAny?.userId) return res.status(401).json({ message: "Unauthorized" });
  // check in request user (set by isAuthenticated) or re-check
  const userEmail = req.user?.email || req.user?.claims?.email;
  if (userEmail !== ADMIN_EMAIL) return res.status(403).json({ message: "Forbidden: Admins only" });
  next();
}

export function registerAdminRoutes(app: Express) {

  // Middleware to attach user to req for admin routes
  app.use("/api/admin", async (req: any, res, next) => {
    const sessionAny = req.session as any;
    if (!sessionAny?.userId) return res.status(401).json({ message: "Unauthorized" });
    try {
      const [user] = await db.select().from(users).where(eq(users.id, sessionAny.userId));
      if (!user) return res.status(401).json({ message: "Unauthorized" });
      req.user = user;
      next();
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  });

  // ── Stats overview ────────────────────────────────────────────────────────
  app.get("/api/admin/stats", isAdmin, async (req, res) => {
    try {
      const [totalUsers] = await db.select({ count: count() }).from(users);
      const [totalProjects] = await db.select({ count: count() }).from(projects);
      const [totalMilestones] = await db.select({ count: count() }).from(milestones);
      const [totalMessages] = await db.select({ count: count() }).from(messages);
      const allEscrows = await db.select().from(escrows);
      const totalEscrowValue = allEscrows.reduce((s, e) => s + e.totalAmount, 0);
      const totalReleased = allEscrows.reduce((s, e) => s + e.releasedAmount, 0);
      const fundedEscrows = allEscrows.filter(e => e.funded).length;

      const allProjects = await db.select().from(projects);
      const statusCounts: Record<string, number> = {};
      allProjects.forEach(p => { statusCounts[p.status] = (statusCounts[p.status] || 0) + 1; });

      const buyers = await db.select({ count: count() }).from(users).where(eq(users.role, "BUYER"));
      const freelancers = await db.select({ count: count() }).from(users).where(eq(users.role, "FREELANCER"));

      res.json({
        totalUsers: totalUsers.count,
        totalProjects: totalProjects.count,
        totalMilestones: totalMilestones.count,
        totalMessages: totalMessages.count,
        totalEscrowValue,
        totalReleased,
        fundedEscrows,
        statusCounts,
        buyers: buyers[0].count,
        freelancers: freelancers[0].count,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to load stats" });
    }
  });

  // ── All users ─────────────────────────────────────────────────────────────
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const allUsers = await db.select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        profileCompleted: users.profileCompleted,
        companyName: users.companyName,
        country: users.country,
        createdAt: users.createdAt,
      }).from(users).orderBy(desc(users.createdAt));
      res.json(allUsers);
    } catch (err) {
      res.status(500).json({ message: "Failed to load users" });
    }
  });

  // ── All projects ──────────────────────────────────────────────────────────
  app.get("/api/admin/projects", isAdmin, async (req, res) => {
    try {
      const allProjects = await db.select().from(projects).orderBy(desc(projects.createdAt));
      // Enrich with buyer/freelancer names
      const enriched = await Promise.all(allProjects.map(async (p) => {
        let buyerName = "—", freelancerName = "—";
        if (p.buyerId) {
          const [buyer] = await db.select({ firstName: users.firstName, lastName: users.lastName, email: users.email, companyName: users.companyName }).from(users).where(eq(users.id, p.buyerId));
          if (buyer) buyerName = buyer.companyName || [buyer.firstName, buyer.lastName].filter(Boolean).join(" ") || buyer.email || "Unknown";
        }
        if (p.freelancerId) {
          const [fl] = await db.select({ firstName: users.firstName, lastName: users.lastName, email: users.email }).from(users).where(eq(users.id, p.freelancerId));
          if (fl) freelancerName = [fl.firstName, fl.lastName].filter(Boolean).join(" ") || fl.email || "Unknown";
        }
        const [escrow] = await db.select().from(escrows).where(eq(escrows.projectId, p.id));
        const mstones = await db.select().from(milestones).where(eq(milestones.projectId, p.id));
        return { ...p, clientName: buyerName, talentName: freelancerName, escrow: escrow || null, milestones: mstones };
      }));
      res.json(enriched);
    } catch (err) {
      res.status(500).json({ message: "Failed to load projects" });
    }
  });

  // ── Recent activity (all messages) ────────────────────────────────────────
  app.get("/api/admin/activity", isAdmin, async (req, res) => {
    try {
      const recent = await db.select().from(messages).orderBy(desc(messages.createdAt)).limit(50);
      res.json(recent);
    } catch (err) {
      res.status(500).json({ message: "Failed to load activity" });
    }
  });

  // ── Check if current user is admin ────────────────────────────────────────
  app.get("/api/admin/me", async (req: any, res) => {
    const sessionAny = req.session as any;
    if (!sessionAny?.userId) return res.json({ isAdmin: false });
    try {
      const [user] = await db.select({ email: users.email }).from(users).where(eq(users.id, sessionAny.userId));
      res.json({ isAdmin: user?.email === ADMIN_EMAIL });
    } catch {
      res.json({ isAdmin: false });
    }
  });

  // ── Growth Engine & Lifecycle Marketing ──────────────────────────────────
  app.get("/api/admin/growth/segments", isAdmin, async (req, res) => {
    try {
      const incomplete = await storage.getIncompleteProfiles();
      const stalled = await storage.getStalledUsers();
      res.json({ incomplete, stalled });
    } catch (err) {
      res.status(500).json({ message: "Failed to load growth segments" });
    }
  });

  app.get("/api/admin/growth/preview/:userId/:day", isAdmin, async (req, res) => {
    try {
      const { userId, day } = req.params;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const content = await marketingService.generateUserChime(user, parseInt(day) as any);
      res.json(content);
    } catch (err) {
      res.status(500).json({ message: "Failed to generate AI growth preview" });
    }
  });

  app.post("/api/admin/growth/chime/:userId", isAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const { day, subject, body } = req.body;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      // Send the email via Resend/SMTP
      const { sendMarketingChimeEmail } = await import("./email");
      await sendMarketingChimeEmail(user.email!, subject, body);

      await storage.createOutreachLog({
        userId: user.id,
        type: `DAY_${day}`,
        content: `Subject: ${subject}\n\n${body}`,
        status: "SENT"
      });

      console.log(`[GROWTH_CHIME] Sent Day ${day} chime to ${user.email}`);
      res.json({ message: "Success chime sent" });
    } catch (err) {
      res.status(500).json({ message: "Failed to send growth chime" });
    }
  });

  app.post("/api/admin/growth/broadcast-welcome", isAdmin, async (req, res) => {
    try {
      const allUsers = await db.select({ email: users.email }).from(users);
      const { sendWelcomeBroadcastEmail } = await import("./email");

      let sentCount = 0;
      let failedCount = 0;
      const failures: { email: string; reason: string }[] = [];

      for (const u of allUsers) {
        if (u.email && u.email !== ADMIN_EMAIL) {
          try {
            await sendWelcomeBroadcastEmail(u.email);
            sentCount++;
            console.log(`[BROADCAST] ✅ Sent to ${u.email}`);
          } catch (emailErr: any) {
            failedCount++;
            const reason = emailErr?.message ?? String(emailErr) ?? 'Unknown error';
            failures.push({ email: u.email, reason });
            console.error(`[BROADCAST] ❌ Failed for ${u.email}: ${reason}`);
          }
        }
      }

      console.log(`[BROADCAST] Complete — sent: ${sentCount}, failed: ${failedCount}`);
      res.json({
        message: `Broadcast complete: ${sentCount} sent, ${failedCount} failed`,
        sentCount,
        failedCount,
        failures,
      });
    } catch (err) {
      console.error("[BROADCAST] Fatal error:", err);
      res.status(500).json({ message: "Failed to send broadcast" });
    }
  });
}
