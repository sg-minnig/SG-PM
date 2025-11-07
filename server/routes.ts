import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCustomTimelineTaskSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Custom Timeline Tasks API
  app.get("/api/timeline-tasks/:memberId", async (req, res) => {
    try {
      const { memberId } = req.params;
      const tasks = await storage.getCustomTimelineTasks(memberId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch custom timeline tasks" });
    }
  });

  app.post("/api/timeline-tasks", async (req, res) => {
    try {
      const validatedData = insertCustomTimelineTaskSchema.parse(req.body);
      const task = await storage.createCustomTimelineTask(validatedData);
      res.json(task);
    } catch (error) {
      res.status(400).json({ error: "Invalid task data" });
    }
  });

  app.patch("/api/timeline-tasks/:id", async (req, res) => {
    try {
      const { id } = req.params;
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

  app.delete("/api/timeline-tasks/:id", async (req, res) => {
    try {
      const { id } = req.params;
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
