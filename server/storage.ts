import { db } from "./db";
import { users, projects, milestones, escrows, ratings, messages, directChats, directMessages, leads, outreachLogs, type User, type UpsertUser, type InsertProject, type InsertMilestone, type InsertEscrow, type Project, type Milestone, type Escrow, type Message, type DirectChat, type DirectMessage, type InsertDirectMessage, type Lead, type InsertLead, type OutreachLog, type InsertOutreachLog } from "@shared/schema";
import { eq, or, asc, ilike, and, desc, notInArray } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  updateUser(id: string, user: Partial<User>): Promise<User>;
  searchFreelancers(query: string): Promise<User[]>;

  getProject(id: string): Promise<Project | undefined>;
  getProjectByCode(code: string): Promise<Project | undefined>;
  getUserProjects(userId: string): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProjectStatus(id: string, status: string): Promise<Project>;
  joinProject(id: string, userId: string, role: string): Promise<Project>;

  getMilestones(projectId: string): Promise<Milestone[]>;
  createMilestone(milestone: InsertMilestone): Promise<Milestone>;
  updateMilestone(id: string, updates: Partial<Milestone>): Promise<Milestone>;

  getEscrow(projectId: string): Promise<Escrow | undefined>;
  createEscrow(escrow: InsertEscrow): Promise<Escrow>;
  updateEscrow(id: string, updates: Partial<Escrow>): Promise<Escrow>;

  getMessages(projectId: string): Promise<Message[]>;
  createMessage(msg: { projectId: string; senderId: string; senderName: string; senderRole: string; content: string }): Promise<Message>;

  getDirectChats(userId: string): Promise<(DirectChat & { otherUser?: Omit<User, "password"> })[]>;
  getDirectChat(chatId: string): Promise<DirectChat | undefined>;
  getOrCreateDirectChat(buyerId: string, freelancerId: string): Promise<DirectChat>;
  getDirectMessages(chatId: string): Promise<DirectMessage[]>;
  createDirectMessage(msg: InsertDirectMessage): Promise<DirectMessage>;

  // Leads & Marketing
  getLeads(): Promise<Lead[]>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: string, updates: Partial<Lead>): Promise<Lead>;
  createOutreachLog(log: InsertOutreachLog): Promise<OutreachLog>;
  getOutreachLogs(leadId: string): Promise<OutreachLog[]>;
  getUserOutreachLogs(userId: string): Promise<OutreachLog[]>;
  getIncompleteProfiles(): Promise<User[]>;
  getStalledUsers(): Promise<User[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async searchFreelancers(query: string): Promise<User[]> {
    if (!query) {
      return await db.select().from(users).where(eq(users.role, 'FREELANCER'));
    }
    return await db.select().from(users)
      .where(and(eq(users.role, 'FREELANCER'), ilike(users.skills, `%${query}%`)));
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async getProjectByCode(code: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.projectCode, code));
    return project;
  }

  async getUserProjects(userId: string): Promise<Project[]> {
    return await db.select().from(projects).where(or(eq(projects.createdBy, userId), eq(projects.buyerId, userId), eq(projects.freelancerId, userId)));
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProjectStatus(id: string, status: string): Promise<Project> {
    const [project] = await db.update(projects).set({ status }).where(eq(projects.id, id)).returning();
    return project;
  }

  async joinProject(id: string, userId: string, role: string): Promise<Project> {
    const updates: any = { status: 'WAITING_FOR_FUNDING' };
    if (role === 'BUYER') updates.buyerId = userId;
    else if (role === 'FREELANCER') updates.freelancerId = userId;

    const [project] = await db.update(projects).set(updates).where(eq(projects.id, id)).returning();
    return project;
  }

  async getMilestones(projectId: string): Promise<Milestone[]> {
    return await db.select().from(milestones).where(eq(milestones.projectId, projectId));
  }

  async createMilestone(milestone: InsertMilestone): Promise<Milestone> {
    const [newMilestone] = await db.insert(milestones).values(milestone).returning();
    return newMilestone;
  }

  async updateMilestone(id: string, updates: Partial<Milestone>): Promise<Milestone> {
    const [milestone] = await db.update(milestones).set(updates).where(eq(milestones.id, id)).returning();
    return milestone;
  }

  async getEscrow(projectId: string): Promise<Escrow | undefined> {
    const [escrow] = await db.select().from(escrows).where(eq(escrows.projectId, projectId));
    return escrow;
  }

  async createEscrow(escrow: InsertEscrow): Promise<Escrow> {
    const [newEscrow] = await db.insert(escrows).values(escrow).returning();
    return newEscrow;
  }

  async updateEscrow(id: string, updates: Partial<Escrow>): Promise<Escrow> {
    const [escrow] = await db.update(escrows).set(updates).where(eq(escrows.id, id)).returning();
    return escrow;
  }

  async getMessages(projectId: string): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.projectId, projectId)).orderBy(asc(messages.createdAt));
  }

  async createMessage(msg: { projectId: string; senderId: string; senderName: string; senderRole: string; content: string }): Promise<Message> {
    const [newMsg] = await db.insert(messages).values(msg).returning();
    return newMsg;
  }

  async getDirectChats(userId: string): Promise<(DirectChat & { otherUser?: Omit<User, "password"> })[]> {
    const rawChats = await db.select().from(directChats)
      .where(or(eq(directChats.buyerId, userId), eq(directChats.freelancerId, userId)))
      .orderBy(asc(directChats.createdAt));
      
    const chatsWithUsers = await Promise.all(rawChats.map(async chat => {
      const otherId = chat.buyerId === userId ? chat.freelancerId : chat.buyerId;
      const otherUser = await this.getUser(otherId);
      if (otherUser) {
        const { password, ...safeUser } = otherUser as any;
        return { ...chat, otherUser: safeUser };
      }
      return chat;
    }));
    return chatsWithUsers as any;
  }

  async getDirectChat(chatId: string): Promise<DirectChat | undefined> {
    const [chat] = await db.select().from(directChats).where(eq(directChats.id, chatId));
    return chat;
  }

  async getOrCreateDirectChat(buyerId: string, freelancerId: string): Promise<DirectChat> {
    const [existing] = await db.select().from(directChats)
      .where(and(eq(directChats.buyerId, buyerId), eq(directChats.freelancerId, freelancerId)));
    if (existing) return existing;
    
    const [existingReverse] = await db.select().from(directChats)
      .where(and(eq(directChats.buyerId, freelancerId), eq(directChats.freelancerId, buyerId)));
    if (existingReverse) return existingReverse;

    const [newChat] = await db.insert(directChats).values({ buyerId, freelancerId }).returning();
    return newChat;
  }

  async getDirectMessages(chatId: string): Promise<DirectMessage[]> {
    return await db.select().from(directMessages).where(eq(directMessages.chatId, chatId)).orderBy(asc(directMessages.createdAt));
  }

  async createDirectMessage(msg: InsertDirectMessage): Promise<DirectMessage> {
    const [newMsg] = await db.insert(directMessages).values(msg).returning();
    return newMsg;
  }

  async getLeads(): Promise<Lead[]> {
    return await db.select().from(leads).orderBy(desc(leads.createdAt));
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const [newLead] = await db.insert(leads).values(lead).onConflictDoNothing().returning();
    return newLead || (await db.select().from(leads).where(eq(leads.email, lead.email)))[0];
  }

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
    const [updated] = await db.update(leads).set(updates).where(eq(leads.id, id)).returning();
    return updated;
  }

  async createOutreachLog(log: InsertOutreachLog): Promise<OutreachLog> {
    const [newLog] = await db.insert(outreachLogs).values(log).returning();
    return newLog;
  }

  async getOutreachLogs(leadId: string): Promise<OutreachLog[]> {
    return await db.select().from(outreachLogs).where(eq(outreachLogs.leadId, leadId)).orderBy(desc(outreachLogs.sentAt));
  }

  async getUserOutreachLogs(userId: string): Promise<OutreachLog[]> {
    return await db.select().from(outreachLogs).where(eq(outreachLogs.userId, userId)).orderBy(desc(outreachLogs.sentAt));
  }

  async getIncompleteProfiles(): Promise<User[]> {
    return await db.select().from(users).where(and(eq(users.profileCompleted, false), or(eq(users.role, 'BUYER'), eq(users.role, 'FREELANCER')))).orderBy(desc(users.createdAt));
  }

  async getStalledUsers(): Promise<User[]> {
    // Get all users with a role
    const allRoleUsers = await db.select().from(users).where(
      or(eq(users.role, 'BUYER'), eq(users.role, 'FREELANCER'))
    ).orderBy(desc(users.createdAt));

    // Get all user IDs who have any project activity
    const activeProjects = await db.select({
      createdBy: projects.createdBy,
      buyerId: projects.buyerId,
      freelancerId: projects.freelancerId,
    }).from(projects);

    const activeUserIds = new Set<string>();
    activeProjects.forEach(p => {
      if (p.createdBy) activeUserIds.add(p.createdBy);
      if (p.buyerId) activeUserIds.add(p.buyerId);
      if (p.freelancerId) activeUserIds.add(p.freelancerId);
    });

    // Filter to users with no project activity
    return allRoleUsers.filter(u => !activeUserIds.has(u.id));
  }
}

export const storage = new DatabaseStorage();
