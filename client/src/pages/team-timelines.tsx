import { RoleTimeline } from "@/components/role-timeline";

export default function TeamTimelines() {
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
      memberName: "Jordan Lee",
      role: "Vice President",
      avatarColor: "#8b5cf6",
      tasks: [
        { id: "1", title: "Meet with outgoing VP", status: "completed" as const, order: 1 },
        { id: "2", title: "Review club constitution", status: "in-progress" as const, order: 2 },
        { id: "3", title: "Update club website", status: "upcoming" as const, order: 3 },
        { id: "4", title: "Coordinate with other executives", status: "upcoming" as const, order: 4 },
        { id: "5", title: "Plan executive retreats", status: "upcoming" as const, order: 5 },
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
      memberName: "Taylor Kim",
      role: "Events Coordinator",
      avatarColor: "#f59e0b",
      tasks: [
        { id: "1", title: "Review past event analytics", status: "completed" as const, order: 1 },
        { id: "2", title: "Recruit new members", status: "in-progress" as const, order: 2 },
        { id: "3", title: "Book venues for semester", status: "upcoming" as const, order: 3 },
        { id: "4", title: "Create event calendar", status: "upcoming" as const, order: 4 },
      ],
    },
    {
      memberName: "Morgan Davis",
      role: "Marketing Director",
      avatarColor: "#ec4899",
      tasks: [
        { id: "1", title: "Audit current social media presence", status: "completed" as const, order: 1 },
        { id: "2", title: "Update social media profiles", status: "in-progress" as const, order: 2 },
        { id: "3", title: "Create content calendar", status: "upcoming" as const, order: 3 },
        { id: "4", title: "Launch membership campaign", status: "upcoming" as const, order: 4 },
      ],
    },
    {
      memberName: "Casey Brown",
      role: "Social Media Manager",
      avatarColor: "#14b8a6",
      tasks: [
        { id: "1", title: "Organize team building activity", status: "completed" as const, order: 1 },
        { id: "2", title: "Set posting schedule", status: "completed" as const, order: 2 },
        { id: "3", title: "Create engagement strategy", status: "in-progress" as const, order: 3 },
        { id: "4", title: "Analyze performance metrics", status: "upcoming" as const, order: 4 },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight" data-testid="text-page-title">
          Role Timelines
        </h1>
        <p className="text-lg text-muted-foreground">
          Detailed view of each executive's progress through their role-specific tasks
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {roleTimelines.map((timeline) => (
          <div key={timeline.memberName} className="border-0 shadow-sm">
            <RoleTimeline {...timeline} />
          </div>
        ))}
      </div>
    </div>
  );
}
