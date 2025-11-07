import { type User, type InsertUser, type CustomTimelineTask, type InsertCustomTimelineTask } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Custom timeline tasks
  getCustomTimelineTasks(memberId: string): Promise<CustomTimelineTask[]>;
  createCustomTimelineTask(task: InsertCustomTimelineTask): Promise<CustomTimelineTask>;
  updateCustomTimelineTask(id: string, task: Partial<InsertCustomTimelineTask>): Promise<CustomTimelineTask | undefined>;
  deleteCustomTimelineTask(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private customTimelineTasks: Map<string, CustomTimelineTask>;

  constructor() {
    this.users = new Map();
    this.customTimelineTasks = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getCustomTimelineTasks(memberId: string): Promise<CustomTimelineTask[]> {
    return Array.from(this.customTimelineTasks.values()).filter(
      (task) => task.memberId === memberId,
    );
  }

  async createCustomTimelineTask(insertTask: InsertCustomTimelineTask): Promise<CustomTimelineTask> {
    const id = randomUUID();
    const task: CustomTimelineTask = {
      ...insertTask,
      id,
      isCustom: true,
      createdAt: new Date(),
    };
    this.customTimelineTasks.set(id, task);
    return task;
  }

  async updateCustomTimelineTask(id: string, updates: Partial<InsertCustomTimelineTask>): Promise<CustomTimelineTask | undefined> {
    const task = this.customTimelineTasks.get(id);
    if (!task) return undefined;

    const updatedTask = { ...task, ...updates };
    this.customTimelineTasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteCustomTimelineTask(id: string): Promise<boolean> {
    return this.customTimelineTasks.delete(id);
  }
}

export const storage = new MemStorage();
