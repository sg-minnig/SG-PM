import { TaskCard } from "@/components/task-card";
import { RoleTimeline } from "@/components/role-timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Target,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {

  const recentTasks = [
    {
      id: "1",
      title: "Plan semester kickoff event",
      description: "Organize venue, catering, and agenda for the first club meeting",
      status: "in-progress",
      priority: "high" as const,
      assignee: { name: "Alex Chen", avatarColor: "#3b82f6" },
      deadline: new Date(2024, 11, 20),
      aiGenerated: true,
    },
    {
      id: "2",
      title: "Update club website",
      description: "Refresh homepage with new executive team photos and contact info",
      status: "not-started",
      priority: "medium" as const,
      assignee: { name: "Jordan Lee", avatarColor: "#8b5cf6" },
      deadline: new Date(2024, 11, 25),
      aiGenerated: false,
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
  ];

  const roleTimelines = [
    {
      memberName: "Alex Chen",
      role: "President",
      advisor: "Dr. Sarah Martinez",
      avatarColor: "#3b82f6",
      tasks: [
        { id: "1", title: "Review transition documents", status: "completed" as const, order: 1 },
        { id: "2", title: "Schedule first executive meeting", status: "completed" as const, order: 2 },
        { id: "3", title: "Plan semester kickoff event", status: "in-progress" as const, order: 3 },
        { id: "4", title: "Set quarterly goals with team", status: "upcoming" as const, order: 4 },
        { id: "5", title: "Prepare annual report", status: "upcoming" as const, order: 5 },
      ],
    },
    {
      memberName: "Sam Wilson",
      role: "Treasurer",
      advisor: "Prof. Michael Chen",
      avatarColor: "#10b981",
      tasks: [
        { id: "1", title: "Review last year's budget", status: "completed" as const, order: 1 },
        { id: "2", title: "Submit budget proposal", status: "completed" as const, order: 2 },
        { id: "3", title: "Set up financial tracking system", status: "completed" as const, order: 3 },
        { id: "4", title: "Schedule finance committee meeting", status: "in-progress" as const, order: 4 },
        { id: "5", title: "Create quarterly financial report", status: "upcoming" as const, order: 5 },
      ],
    },
    {
      memberName: "Jordan Lee",
      role: "Vice President",
      advisor: "Dr. Sarah Martinez",
      avatarColor: "#8b5cf6",
      tasks: [
        { id: "1", title: "Meet with outgoing VP", status: "completed" as const, order: 1 },
        { id: "2", title: "Review club constitution", status: "in-progress" as const, order: 2 },
        { id: "3", title: "Update club website", status: "upcoming" as const, order: 3 },
        { id: "4", title: "Coordinate with other executives", status: "upcoming" as const, order: 4 },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight" data-testid="text-page-title">
          Dashboard
        </h1>
        <p className="text-lg text-muted-foreground">
          Track role progress and upcoming activities
        </p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Team Role Progress</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                See where each executive is in their role-specific task timeline
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {roleTimelines.map((timeline) => (
              <div key={timeline.memberName} className="p-5 rounded-xl border border-border bg-background shadow-sm hover-elevate">
                <RoleTimeline {...timeline} compact={true} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentTasks.map((task) => (
              <TaskCard key={task.id} {...task} />
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-xl">Upcoming Deadlines</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTasks
                .filter((t) => t.status !== "completed")
                .map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover-elevate"
                    data-testid={`deadline-${task.id}`}
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{task.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Assigned to {task.assignee.name}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground ml-4">
                      {task.deadline && format(task.deadline, "MMM d, yyyy")}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
