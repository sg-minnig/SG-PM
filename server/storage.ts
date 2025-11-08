// Database storage implementation
import {
  users,
  teamMembers,
  customTimelineTasks,
  type User,
  type UpsertUser,
  type TeamMember,
  type InsertTeamMember,
  type CustomTimelineTask,
  type InsertCustomTimelineTask,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(id: string, role: string): Promise<User | undefined>;
  
  // Team member operations
  getTeamMembers(): Promise<TeamMember[]>;
  getTeamMemberByUserId(userId: string): Promise<TeamMember | undefined>;
  linkTeamMemberToUser(email: string, userId: string): Promise<void>;
  createTeamMember(member: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(id: string, updates: Partial<InsertTeamMember>): Promise<TeamMember | undefined>;
  deleteTeamMember(id: string): Promise<boolean>;
  
  // Custom timeline tasks
  getCustomTimelineTasks(memberId: string): Promise<CustomTimelineTask[]>;
  createCustomTimelineTask(task: InsertCustomTimelineTask): Promise<CustomTimelineTask>;
  updateCustomTimelineTask(id: string, task: Partial<InsertCustomTimelineTask>): Promise<CustomTimelineTask | undefined>;
  deleteCustomTimelineTask(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Normalize email to lowercase for consistent matching
    const normalizedData = {
      ...userData,
      email: userData.email?.toLowerCase().trim() || null,
    };
    
    // First try to find user by ID
    if (userData.id) {
      const existing = await this.getUser(userData.id);
      
      if (existing) {
        // Update existing user (preserve role)
        const [user] = await db
          .update(users)
          .set({
            ...normalizedData,
            updatedAt: new Date(),
          })
          .where(eq(users.id, existing.id))
          .returning();
        return user;
      }
    }
    
    // Check if user exists by email (case-insensitive)
    if (normalizedData.email) {
      const [existingByEmail] = await db
        .select()
        .from(users)
        .where(eq(users.email, normalizedData.email));
      
      if (existingByEmail) {
        // Update existing user found by email
        const [user] = await db
          .update(users)
          .set({
            ...normalizedData,
            updatedAt: new Date(),
          })
          .where(eq(users.email, normalizedData.email))
          .returning();
        return user;
      }
    }
    
    // Check if this is the first user - they become president automatically
    const existingUsers = await db.select().from(users);
    const isFirstUser = existingUsers.length === 0;
    
    // Create new user
    const [user] = await db
      .insert(users)
      .values({
        ...normalizedData,
        role: isFirstUser ? "president" : "member",
      })
      .returning();
    return user;
  }

  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Team member operations
  async getTeamMembers(): Promise<TeamMember[]> {
    return await db.select().from(teamMembers);
  }

  async getTeamMemberByUserId(userId: string): Promise<TeamMember | undefined> {
    const [member] = await db.select().from(teamMembers).where(eq(teamMembers.userId, userId));
    return member;
  }

  async linkTeamMemberToUser(email: string, userId: string): Promise<void> {
    // Normalize email for case-insensitive matching
    const normalizedEmail = email.toLowerCase().trim();
    
    // Find team member by email and link to user if not already linked
    await db
      .update(teamMembers)
      .set({ userId })
      .where(eq(teamMembers.email, normalizedEmail));
  }

  async createTeamMember(memberData: InsertTeamMember): Promise<TeamMember> {
    // Normalize email to lowercase for consistent matching
    const normalizedData = {
      ...memberData,
      email: memberData.email.toLowerCase().trim(),
    };
    
    const [member] = await db.insert(teamMembers).values(normalizedData).returning();
    return member;
  }

  async updateTeamMember(id: string, updates: Partial<InsertTeamMember>): Promise<TeamMember | undefined> {
    // Normalize email if it's being updated
    const normalizedUpdates = {
      ...updates,
      ...(updates.email ? { email: updates.email.toLowerCase().trim() } : {}),
    };
    
    const [member] = await db
      .update(teamMembers)
      .set(normalizedUpdates)
      .where(eq(teamMembers.id, id))
      .returning();
    return member;
  }

  async deleteTeamMember(id: string): Promise<boolean> {
    const result = await db.delete(teamMembers).where(eq(teamMembers.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Custom timeline tasks
  async getCustomTimelineTasks(memberId: string): Promise<CustomTimelineTask[]> {
    return await db.select().from(customTimelineTasks).where(eq(customTimelineTasks.memberId, memberId));
  }

  async createCustomTimelineTask(taskData: InsertCustomTimelineTask): Promise<CustomTimelineTask> {
    const [task] = await db.insert(customTimelineTasks).values(taskData).returning();
    return task;
  }

  async updateCustomTimelineTask(id: string, updates: Partial<InsertCustomTimelineTask>): Promise<CustomTimelineTask | undefined> {
    const [task] = await db
      .update(customTimelineTasks)
      .set(updates)
      .where(eq(customTimelineTasks.id, id))
      .returning();
    return task;
  }

  async deleteCustomTimelineTask(id: string): Promise<boolean> {
    const result = await db.delete(customTimelineTasks).where(eq(customTimelineTasks.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
