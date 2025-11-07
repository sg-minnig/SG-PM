import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskCard } from "@/components/task-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Filter } from "lucide-react";

export default function Tasks() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const tasks = [
    {
      id: "1",
      title: "Plan semester kickoff event",
      description: "Organize venue, catering, and agenda for the first club meeting of the semester",
      status: "in-progress",
      priority: "high" as const,
      assignee: { name: "Alex Chen", avatarColor: "#3b82f6" },
      deadline: new Date(2024, 11, 20),
      aiGenerated: true,
    },
    {
      id: "2",
      title: "Update club website",
      description: "Refresh homepage with new executive team photos and updated contact information",
      status: "not-started",
      priority: "medium" as const,
      assignee: { name: "Jordan Lee", avatarColor: "#8b5cf6" },
      deadline: new Date(2024, 11, 25),
    },
    {
      id: "3",
      title: "Submit budget proposal",
      description: "Prepare and submit quarterly budget request to student council",
      status: "completed",
      priority: "high" as const,
      assignee: { name: "Sam Wilson", avatarColor: "#10b981" },
      deadline: new Date(2024, 11, 10),
      aiGenerated: true,
    },
    {
      id: "4",
      title: "Recruit new members",
      description: "Create marketing materials and host information sessions for prospective members",
      status: "in-progress",
      priority: "medium" as const,
      assignee: { name: "Taylor Kim", avatarColor: "#f59e0b" },
      deadline: new Date(2024, 11, 18),
    },
    {
      id: "5",
      title: "Update social media profiles",
      description: "Refresh Instagram, Facebook, and LinkedIn with current club information",
      status: "not-started",
      priority: "low" as const,
      assignee: { name: "Morgan Davis", avatarColor: "#ec4899" },
      deadline: new Date(2024, 11, 30),
    },
    {
      id: "6",
      title: "Organize team building activity",
      description: "Plan and execute executive team bonding event to improve collaboration",
      status: "completed",
      priority: "medium" as const,
      assignee: { name: "Casey Brown", avatarColor: "#14b8a6" },
      deadline: new Date(2024, 10, 28),
      aiGenerated: true,
    },
    {
      id: "7",
      title: "Create annual report",
      description: "Compile achievements, statistics, and goals for the year-end report",
      status: "in-progress",
      priority: "high" as const,
      assignee: { name: "Riley Martinez", avatarColor: "#f97316" },
      deadline: new Date(2024, 11, 22),
      aiGenerated: true,
    },
    {
      id: "8",
      title: "Schedule executive meetings",
      description: "Set up recurring bi-weekly meetings for executive team coordination",
      status: "completed",
      priority: "low" as const,
      assignee: { name: "Jamie Anderson", avatarColor: "#06b6d4" },
      deadline: new Date(2024, 10, 15),
    },
  ];

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="text-page-title">
            Tasks
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all club activities
          </p>
        </div>
        <Button data-testid="button-create-task">
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-tasks"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40" data-testid="select-status-filter">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="not-started">Not Started</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-40" data-testid="select-priority-filter">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No tasks found
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard key={task.id} {...task} />
          ))
        )}
      </div>
    </div>
  );
}
