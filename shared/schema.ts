import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

export * from "./models/auth";

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectCode: varchar("project_code", { length: 6 }).notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  currency: varchar("currency", { length: 10 }).notNull().default("USD"),
  createdBy: varchar("created_by").notNull(),
  buyerId: varchar("buyer_id"),
  freelancerId: varchar("freelancer_id"),
  status: varchar("status").notNull().default('WAITING_FOR_ACCEPTANCE'),
  expiresAt: timestamp("expires_at").notNull(),
  documentUrl: text("document_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const milestones = pgTable("milestones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  amount: integer("amount").notNull(), // Amount in cents
  deadline: timestamp("deadline").notNull(),
  status: varchar("status").notNull().default('PENDING'),
  submissionUrl: text("submission_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const escrows = pgTable("escrows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().unique(),
  totalAmount: integer("total_amount").notNull(),
  funded: boolean("funded").notNull().default(false),
  fundedAt: timestamp("funded_at"),
  releasedAmount: integer("released_amount").notNull().default(0),
  remainingAmount: integer("remaining_amount").notNull(),
});

export const ratings = pgTable("ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  reviewerId: varchar("reviewer_id").notNull(),
  revieweeId: varchar("reviewee_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  senderId: varchar("sender_id").notNull(),
  senderName: varchar("sender_name").notNull(),
  senderRole: varchar("sender_role").notNull(), // 'BUYER' | 'FREELANCER'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const directChats = pgTable("direct_chats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  buyerId: varchar("buyer_id").notNull(),
  freelancerId: varchar("freelancer_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const directMessages = pgTable("direct_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chatId: varchar("chat_id").notNull(), // reference to directChats.id
  senderId: varchar("sender_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull().unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  company: varchar("company"),
  location: varchar("location"),
  linkedinUrl: text("linkedin_url"),
  skills: text("skills"),
  status: varchar("status").notNull().default('NEW'), // 'NEW', 'CONTACTED', 'REPLIED', 'BOUNCED'
  source: varchar("source").default('APOLLO'), 
  createdAt: timestamp("created_at").defaultNow(),
});

export const outreachLogs = pgTable("outreach_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").notNull(),
  type: varchar("type").notNull(), // 'EMAIL_1', 'FOLLOW_UP_1', etc.
  content: text("content").notNull(),
  status: varchar("status"), // 'SENT', 'FAILED'
  sentAt: timestamp("sent_at").defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true, projectCode: true, createdBy: true, status: true, expiresAt: true, buyerId: true }).extend({
  currency: z.string().min(1).max(10).default("USD").optional(),
  expiresAt: z.coerce.date().optional(),
  freelancerId: z.string().optional(),
});

export const insertMilestoneSchema = createInsertSchema(milestones).omit({ id: true, createdAt: true, status: true, submissionUrl: true });
export const insertEscrowSchema = createInsertSchema(escrows).omit({ id: true });
export const insertRatingSchema = createInsertSchema(ratings).omit({ id: true, createdAt: true, reviewerId: true });
export const insertDirectChatSchema = createInsertSchema(directChats).omit({ id: true, createdAt: true });
export const insertDirectMessageSchema = createInsertSchema(directMessages).omit({ id: true, createdAt: true });

export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true });
export const insertOutreachLogSchema = createInsertSchema(outreachLogs).omit({ id: true, sentAt: true });

// Types
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Milestone = typeof milestones.$inferSelect;
export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;
export type Escrow = typeof escrows.$inferSelect;
export type InsertEscrow = z.infer<typeof insertEscrowSchema>;
export type Rating = typeof ratings.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;
export type Message = typeof messages.$inferSelect;
export type DirectChat = typeof directChats.$inferSelect;
export type InsertDirectChat = z.infer<typeof insertDirectChatSchema>;
export type DirectMessage = typeof directMessages.$inferSelect;
export type InsertDirectMessage = z.infer<typeof insertDirectMessageSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type OutreachLog = typeof outreachLogs.$inferSelect;
export type InsertOutreachLog = z.infer<typeof insertOutreachLogSchema>;

// API Request/Response Types
export type UpdateProfileRequest = {
  role?: 'BUYER' | 'FREELANCER';
  companyName?: string;
  phone?: string;
  country?: string;
  skills?: string;
  portfolioLink?: string;
  bio?: string;
  resumeUrl?: string;
};

export type JoinProjectRequest = {
  projectCode: string;
};

export type SubmitMilestoneRequest = {
  submissionUrl: string;
};

export type FundProjectRequest = {};
