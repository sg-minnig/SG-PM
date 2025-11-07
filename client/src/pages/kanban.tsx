import { useState } from "react";
import { TaskCard } from "@/components/task-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "not-started" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  assignee?: {
    name: string;
    avatarColor: string;
  };
  deadline?: Date;
  aiGenerated?: boolean;
}

export default function Kanban() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Plan semester kickoff event",
      description: "Organize venue, catering, and agenda",
      status: "in-progress",
      priority: "high",
      assignee: { name: "Alex Chen", avatarColor: "#3b82f6" },
      deadline: new Date(2024, 11, 20),
      aiGenerated: true,
    },
    {
      id: "2",
      title: "Update club website",
      description: "Refresh homepage with new executive team",
      status: "not-started",
      priority: "medium",
      assignee: { name: "Jordan Lee", avatarColor: "#8b5cf6" },
      deadline: new Date(2024, 11, 25),
    },
    {
      id: "3",
      title: "Submit budget proposal",
      description: "Prepare quarterly budget request",
      status: "completed",
      priority: "high",
      assignee: { name: "Sam Wilson", avatarColor: "#10b981" },
      deadline: new Date(2024, 11, 10),
      aiGenerated: true,
    },
    {
      id: "4",
      title: "Recruit new members",
      description: "Create marketing materials and host info sessions",
      status: "in-progress",
      priority: "medium",
      assignee: { name: "Taylor Kim", avatarColor: "#f59e0b" },
      deadline: new Date(2024, 11, 18),
    },
    {
      id: "5",
      title: "Update social media profiles",
      description: "Refresh Instagram and LinkedIn with current info",
      status: "not-started",
      priority: "low",
      assignee: { name: "Morgan Davis", avatarColor: "#ec4899" },
      deadline: new Date(2024, 11, 30),
    },
    {
      id: "6",
      title: "Organize team building activity",
      description: "Plan and execute executive team bonding event",
      status: "completed",
      priority: "medium",
      assignee: { name: "Casey Brown", avatarColor: "#14b8a6" },
      deadline: new Date(2024, 10, 28),
      aiGenerated: true,
    },
  ]);

  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  const columns = [
    { id: "not-started", title: "Not Started", color: "text-muted-foreground" },
    { id: "in-progress", title: "In Progress", color: "text-primary" },
    { id: "completed", title: "Completed", color: "text-chart-3" },
  ];

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (status: "not-started" | "in-progress" | "completed") => {
    if (draggedTask) {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === draggedTask ? { ...task, status } : task
        )
      );
      setDraggedTask(null);
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold" data-testid="text-page-title">
          Kanban Board
        </h1>
        <p className="text-muted-foreground mt-1">
          Drag and drop tasks to update their status
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.id);
          return (
            <Card
              key={column.id}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id as any)}
              data-testid={`column-${column.id}`}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between gap-2">
                  <span className={`text-base ${column.color}`}>
                    {column.title}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {columnTasks.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {columnTasks.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No tasks
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task.id)}
                      className="cursor-move"
                    >
                      <TaskCard
                        {...task}
                        isDragging={draggedTask === task.id}
                      />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
