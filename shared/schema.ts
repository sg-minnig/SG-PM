import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, index, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table (updated for Replit Auth + role management)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("member"), // "president" or "member"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Team members table (linked to users after login)
export const teamMembers = pgTable("team_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"), // references users.id - null until user logs in
  name: text("name").notNull(),
  position: text("position").notNull(), // "President", "Vice President", etc.
  email: text("email").notNull().unique(), // Used to link to user account
  phone: text("phone"),
  instagram: text("instagram"),
  advisorName: text("advisor_name"),
  advisorEmail: text("advisor_email"),
  avatarColor: text("avatar_color").notNull(),
  profileImageUrl: text("profile_image_url"), // URL to uploaded profile image in object storage
  createdAt: timestamp("created_at").defaultNow(),
});

export const customTimelineTasks = pgTable("custom_timeline_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  memberId: varchar("member_id").notNull(),
  title: text("title").notNull(),
  status: text("status").notNull(),
  order: varchar("order").notNull(),
  isCustom: boolean("is_custom").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("pending"),
  position: text("position"), // Which role/position this task is for
  assigneeId: varchar("assignee_id"),
  deadline: timestamp("deadline"),
  priority: text("priority").notNull().default("medium"),
  documentId: varchar("document_id"),
  aiGenerated: boolean("ai_generated").default(false),
  approved: boolean("approved").default(false),
  order: varchar("order"), // For timeline ordering
  createdAt: timestamp("created_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  position: text("position").notNull(), // Which role/position this document is for
  fileUrl: text("file_url").notNull(), // Object storage URL
  content: text("content"), // Extracted text content for AI processing
  size: text("size").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  uploadedBy: varchar("uploaded_by"), // User ID who uploaded
  analyzed: boolean("analyzed").default(false),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  teamMember: one(teamMembers, {
    fields: [users.id],
    references: [teamMembers.userId],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  createdAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadedAt: true,
});

export const insertCustomTimelineTaskSchema = createInsertSchema(customTimelineTasks).omit({
  id: true,
  createdAt: true,
  isCustom: true,
});

// Types
export type User = typeof users.$inferSelect;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type CustomTimelineTask = typeof customTimelineTasks.$inferSelect;
export type InsertCustomTimelineTask = z.infer<typeof insertCustomTimelineTaskSchema>;
