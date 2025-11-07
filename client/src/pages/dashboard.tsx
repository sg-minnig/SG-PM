import { StatCard } from "@/components/stat-card";
import { TaskCard } from "@/components/task-card";
import { RoleTimeline } from "@/components/role-timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  Users,
  TrendingUp,
  Target,
} from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { format } from "date-fns";

export default function Dashboard() {
  const chartData = [
    { name: "Mon", tasks: 4 },
    { name: "Tue", tasks: 7 },
    { name: "Wed", tasks: 5 },
    { name: "Thu", tasks: 9 },
    { name: "Fri", tasks: 6 },
  ];

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold" data-testid="text-page-title">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Overview of your club's activities and progress
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Tasks"
          value={42}
          icon={ClipboardList}
          description="from last month"
          trend="+12%"
        />
        <StatCard
          title="In Progress"
          value={18}
          icon={Clock}
          description="active tasks"
        />
        <StatCard
          title="Completed"
          value={24}
          icon={CheckCircle2}
          description="this month"
          trend="+8%"
        />
        <StatCard
          title="Team Members"
          value={8}
          icon={Users}
          description="active executives"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Task Completion This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="name"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Bar dataKey="tasks" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentTasks.map((task) => (
              <TaskCard key={task.id} {...task} />
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Role Timeline Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Track where each executive is in their role-specific task timeline
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {roleTimelines.map((timeline) => (
              <div key={timeline.memberName} className="p-4 rounded-lg border border-border bg-card">
                <RoleTimeline {...timeline} compact={true} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTasks
              .filter((t) => t.status !== "completed")
              .map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  data-testid={`deadline-${task.id}`}
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{task.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      Assigned to {task.assignee.name}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {task.deadline && format(task.deadline, "MMM d, yyyy")}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
