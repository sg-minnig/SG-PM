// Database storage implementation
import {
  users,
  teamMembers,
  customTimelineTasks,
  documents,
  tasks,
  events,
  type User,
  type UpsertUser,
  type TeamMember,
  type InsertTeamMember,
  type CustomTimelineTask,
  type InsertCustomTimelineTask,
  type Document,
  type InsertDocument,
  type Task,
  type InsertTask,
  type Event,
  type InsertEvent,
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
  
  // Documents
  getDocuments(): Promise<Document[]>;
  getDocumentById(id: string): Promise<Document | undefined>;
  getDocumentsByPosition(position: string): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: string, updates: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: string): Promise<boolean>;
  
  // Tasks
  getTasks(): Promise<Task[]>;
  getTaskById(id: string): Promise<Task | undefined>;
  getTasksByPosition(position: string): Promise<Task[]>;
  getTasksByDocumentId(documentId: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;
  
  // Events
  getEvents(): Promise<Event[]>;
  getEventById(id: string): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, updates: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: string): Promise<boolean>;
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

  // Documents
  async getDocuments(): Promise<Document[]> {
    return await db.select().from(documents);
  }

  async getDocumentById(id: string): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  }

  async getDocumentsByPosition(position: string): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.position, position));
  }

  async createDocument(documentData: InsertDocument): Promise<Document> {
    const [document] = await db.insert(documents).values(documentData).returning();
    return document;
  }

  async updateDocument(id: string, updates: Partial<InsertDocument>): Promise<Document | undefined> {
    const [document] = await db
      .update(documents)
      .set(updates)
      .where(eq(documents.id, id))
      .returning();
    return document;
  }

  async deleteDocument(id: string): Promise<boolean> {
    const result = await db.delete(documents).where(eq(documents.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    return await db.select().from(tasks);
  }

  async getTaskById(id: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async getTasksByPosition(position: string): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.position, position));
  }

  async getTasksByDocumentId(documentId: string): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.documentId, documentId));
  }

  async createTask(taskData: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values(taskData).returning();
    return task;
  }

  async updateTask(id: string, updates: Partial<InsertTask>): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, id))
      .returning();
    return task;
  }

  async deleteTask(id: string): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Events
  async getEvents(): Promise<Event[]> {
    return await db.select().from(events);
  }

  async getEventById(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async createEvent(eventData: InsertEvent): Promise<Event> {
    const [event] = await db.insert(events).values(eventData).returning();
    return event;
  }

  async updateEvent(id: string, updates: Partial<InsertEvent>): Promise<Event | undefined> {
    const [event] = await db
      .update(events)
      .set(updates)
      .where(eq(events.id, id))
      .returning();
    return event;
  }

  async deleteEvent(id: string): Promise<boolean> {
    const result = await db.delete(events).where(eq(events.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
