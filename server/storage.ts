import { db } from "./db";
import { users, projects, milestones, escrows, ratings, type User, type UpsertUser, type InsertProject, type InsertMilestone, type InsertEscrow, type Project, type Milestone, type Escrow } from "@shared/schema";
import { eq, or } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  updateUser(id: string, user: Partial<User>): Promise<User>;

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
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
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
}

export const storage = new DatabaseStorage();
