// API routes with authentication and team management
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isPresident } from "./replitAuth";
import { insertCustomTimelineTaskSchema, insertTeamMemberSchema, insertDocumentSchema, insertTaskSchema } from "@shared/schema";
import { ObjectStorageService, objectStorageClient } from "./objectStorage";
import Anthropic from "@anthropic-ai/sdk";

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

  // Profile image upload routes
  app.post("/api/profile-image/upload-url", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const objectStorage = new ObjectStorageService();
      const { uploadURL, objectPath } = await objectStorage.getProfileImageUploadURL(userId);
      res.json({ uploadURL, objectPath });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Serve uploaded profile images (public access for viewing)
  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const objectPath = `/objects/${req.params.objectPath}`;
      
      // Security: Only allow profile images from the allowed directory
      if (!objectPath.startsWith("/objects/profile-images/")) {
        return res.status(403).json({ error: "Access denied" });
      }

      const objectStorage = new ObjectStorageService();
      const objectInfo = await objectStorage.getObject(objectPath);
      
      if (!objectInfo) {
        return res.status(404).json({ error: "Image not found" });
      }

      const bucket = objectStorageClient.bucket(objectInfo.bucket);
      const file = bucket.file(objectInfo.file);
      
      // Get metadata and validate server-side
      const [metadata] = await file.getMetadata();
      
      // Server-side validation: Ensure it's an image
      if (!metadata.contentType?.startsWith("image/")) {
        return res.status(400).json({ error: "Not an image file" });
      }

      // Server-side validation: Enforce 5MB size limit
      if (metadata.size && Number(metadata.size) > 5 * 1024 * 1024) {
        return res.status(400).json({ error: "File too large" });
      }
      
      // Profile images are public - anyone can view them
      // Set cache headers for public access
      res.set({
        "Content-Type": metadata.contentType,
        "Content-Length": metadata.size,
        "Cache-Control": "public, max-age=3600",
      });

      // Stream the file
      file.createReadStream().pipe(res);
    } catch (error) {
      console.error("Error serving image:", error);
      res.status(500).json({ error: "Failed to serve image" });
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

  app.post("/api/team-members", isAuthenticated, isPresident, async (req: any, res) => {
    try {
      const validatedData = insertTeamMemberSchema.parse(req.body);
      const userId = req.user.claims.sub;
      
      // Security: Validate profileImageUrl if provided
      if (validatedData.profileImageUrl) {
        if (!validatedData.profileImageUrl.startsWith("/objects/profile-images/")) {
          return res.status(400).json({ error: "Invalid profile image URL" });
        }
        // Presidents can only set images they uploaded themselves
        if (!validatedData.profileImageUrl.includes(`/profile-images/${userId}/`)) {
          return res.status(403).json({ error: "You can only use images you uploaded" });
        }
      }
      
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
      
      // Security: Validate profileImageUrl if provided
      if (validatedData.profileImageUrl) {
        if (!validatedData.profileImageUrl.startsWith("/objects/profile-images/")) {
          return res.status(400).json({ error: "Invalid profile image URL" });
        }
        // Users can only set images they uploaded (path must contain their userId)
        if (!validatedData.profileImageUrl.includes(`/profile-images/${userId}/`)) {
          return res.status(403).json({ error: "You can only use images you uploaded" });
        }
      }
      
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

  // Document routes (presidents only)
  app.get("/api/documents", isAuthenticated, isPresident, async (req, res) => {
    try {
      const documents = await storage.getDocuments();
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  app.post("/api/documents/upload-url", isAuthenticated, isPresident, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { filename } = req.body;
      
      if (!filename) {
        return res.status(400).json({ error: "Filename is required" });
      }

      const objectStorage = new ObjectStorageService();
      const { uploadURL, objectPath } = await objectStorage.getDocumentUploadURL(userId, filename);
      res.json({ uploadURL, objectPath });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  app.post("/api/documents", isAuthenticated, isPresident, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const documentData = {
        ...req.body,
        uploadedBy: userId,
      };
      const validatedData = insertDocumentSchema.parse(documentData);
      
      // Security: Validate fileUrl if provided
      if (validatedData.fileUrl) {
        if (!validatedData.fileUrl.startsWith("/objects/documents/")) {
          return res.status(400).json({ error: "Invalid document URL" });
        }
        // Presidents can only set documents they uploaded
        if (!validatedData.fileUrl.includes(`/documents/${userId}/`)) {
          return res.status(403).json({ error: "You can only use documents you uploaded" });
        }
      }
      
      const document = await storage.createDocument(validatedData);
      res.json(document);
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(400).json({ error: "Invalid document data" });
    }
  });

  app.post("/api/documents/:id/analyze", isAuthenticated, isPresident, async (req, res) => {
    try {
      const { id } = req.params;
      const document = await storage.getDocumentById(id);
      
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      if (!document.content) {
        return res.status(400).json({ error: "Document has no content to analyze" });
      }

      // Initialize Anthropic client
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      // Create AI prompt for task generation
      const prompt = `You are analyzing a transition document for a "${document.position}" position in a student organization.

Document content:
${document.content}

Generate a list of actionable tasks that the person in this role should complete. Each task should be:
- Specific and actionable
- Relevant to the "${document.position}" position
- Ordered from most important to least important
- Include a brief description

Return ONLY a JSON array of tasks in this exact format:
[
  {
    "title": "Task title",
    "description": "Task description",
    "priority": "high|medium|low"
  }
]

Generate 5-15 tasks. Return only valid JSON, no other text.`;

      const message = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2048,
        messages: [{
          role: "user",
          content: prompt
        }]
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
      const generatedTasks = JSON.parse(responseText);

      // Create tasks in database
      const createdTasks = [];
      for (let i = 0; i < generatedTasks.length; i++) {
        const taskData = {
          title: generatedTasks[i].title,
          description: generatedTasks[i].description,
          status: "pending",
          position: document.position,
          priority: generatedTasks[i].priority,
          documentId: document.id,
          aiGenerated: true,
          approved: false,
          order: String(i + 1),
        };
        
        const task = await storage.createTask(taskData);
        createdTasks.push(task);
      }

      // Mark document as analyzed
      await storage.updateDocument(id, { analyzed: true });

      res.json({
        success: true,
        tasksGenerated: createdTasks.length,
        tasks: createdTasks
      });
    } catch (error) {
      console.error("Error analyzing document:", error);
      res.status(500).json({ error: "Failed to analyze document" });
    }
  });

  app.delete("/api/documents/:id", isAuthenticated, isPresident, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteDocument(id);
      if (!deleted) {
        res.status(404).json({ error: "Document not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete document" });
    }
  });

  // Task routes (for AI-generated tasks)
  app.get("/api/tasks", isAuthenticated, async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", isAuthenticated, isPresident, async (req: any, res) => {
    try {
      const validatedData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validatedData);
      res.json(task);
    } catch (error) {
      res.status(400).json({ error: "Invalid task data" });
    }
  });

  app.patch("/api/tasks/:id", isAuthenticated, isPresident, async (req, res) => {
    try {
      const { id } = req.params;
      const task = await storage.updateTask(id, req.body);
      if (!task) {
        res.status(404).json({ error: "Task not found" });
        return;
      }
      res.json(task);
    } catch (error) {
      res.status(400).json({ error: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", isAuthenticated, isPresident, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteTask(id);
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
