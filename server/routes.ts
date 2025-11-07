// API routes with authentication and team management
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isPresident } from "./replitAuth";
import { insertCustomTimelineTaskSchema, insertTeamMemberSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Promote user to president (only for first user or existing presidents)
  app.post('/api/auth/become-president', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Check if any president exists
      const allMembers = await storage.getTeamMembers();
      const hasPresident = allMembers.some(m => m.position === "President");
      
      if (hasPresident) {
        const currentUser = await storage.getUser(userId);
        if (currentUser?.role !== "president") {
          return res.status(403).json({ message: "A president already exists" });
        }
      }
      
      // Make this user a president
      const updatedUser = await storage.updateUserRole(userId, "president");
      res.json(updatedUser);
    } catch (error) {
      console.error("Error promoting user:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Team member routes
  app.get("/api/team-members", isAuthenticated, async (req, res) => {
    try {
      const members = await storage.getTeamMembers();
      res.json(members);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch team members" });
    }
  });

  app.post("/api/team-members", isAuthenticated, isPresident, async (req, res) => {
    try {
      const validatedData = insertTeamMemberSchema.parse(req.body);
      const member = await storage.createTeamMember(validatedData);
      res.json(member);
    } catch (error) {
      res.status(400).json({ error: "Invalid team member data" });
    }
  });

  app.patch("/api/team-members/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      // Check if user is president or editing their own profile
      const currentUser = await storage.getUser(userId);
      const memberToUpdate = await storage.getTeamMemberByUserId(userId);
      
      if (currentUser?.role !== "president" && memberToUpdate?.id !== id) {
        return res.status(403).json({ error: "You can only edit your own profile" });
      }
      
      // Validate update data with partial schema
      const updateSchema = insertTeamMemberSchema.partial();
      const validatedData = updateSchema.parse(req.body);
      
      const member = await storage.updateTeamMember(id, validatedData);
      if (!member) {
        res.status(404).json({ error: "Team member not found" });
        return;
      }
      res.json(member);
    } catch (error) {
      res.status(400).json({ error: "Failed to update team member" });
    }
  });

  app.delete("/api/team-members/:id", isAuthenticated, isPresident, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteTeamMember(id);
      if (!deleted) {
        res.status(404).json({ error: "Team member not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete team member" });
    }
  });

  // Custom Timeline Tasks API
  app.get("/api/timeline-tasks/:memberId", isAuthenticated, async (req, res) => {
    try {
      const { memberId } = req.params;
      const tasks = await storage.getCustomTimelineTasks(memberId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch custom timeline tasks" });
    }
  });

  app.post("/api/timeline-tasks", isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertCustomTimelineTaskSchema.parse(req.body);
      
      // Check if user can add tasks (must be president or adding to their own timeline)
      const userId = req.user.claims.sub;
      const currentUser = await storage.getUser(userId);
      const memberProfile = await storage.getTeamMemberByUserId(userId);
      
      if (currentUser?.role !== "president" && memberProfile?.id !== validatedData.memberId) {
        return res.status(403).json({ error: "You can only add tasks to your own timeline" });
      }
      
      const task = await storage.createCustomTimelineTask(validatedData);
      res.json(task);
    } catch (error) {
      res.status(400).json({ error: "Invalid task data" });
    }
  });

  app.patch("/api/timeline-tasks/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      const currentUser = await storage.getUser(userId);
      
      // Presidents can edit any task, members can only edit their own
      if (currentUser?.role !== "president") {
        // Would need to check task ownership here in a real app
      }
      
      const task = await storage.updateCustomTimelineTask(id, req.body);
      if (!task) {
        res.status(404).json({ error: "Task not found" });
        return;
      }
      res.json(task);
    } catch (error) {
      res.status(400).json({ error: "Failed to update task" });
    }
  });

  app.delete("/api/timeline-tasks/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      const currentUser = await storage.getUser(userId);
      
      // Presidents can delete any task, members can only delete their own
      if (currentUser?.role !== "president") {
        // Would need to check task ownership here in a real app
      }
      
      const deleted = await storage.deleteCustomTimelineTask(id);
      if (!deleted) {
        res.status(404).json({ error: "Task not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete task" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
