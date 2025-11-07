import { RoleTimeline } from "../role-timeline";

export default function RoleTimelineExample() {
  const tasks = [
    { id: "1", title: "Review transition documents", status: "completed" as const, order: 1 },
    { id: "2", title: "Schedule first executive meeting", status: "completed" as const, order: 2 },
    { id: "3", title: "Update club website and social media", status: "in-progress" as const, order: 3 },
    { id: "4", title: "Recruit new members", status: "upcoming" as const, order: 4 },
    { id: "5", title: "Plan semester kickoff event", status: "upcoming" as const, order: 5 },
  ];

  return (
    <div className="p-6 bg-background space-y-6">
      <div className="max-w-md">
        <RoleTimeline
          memberName="Alex Chen"
          role="President"
          avatarColor="#3b82f6"
          tasks={tasks}
        />
      </div>
      
      <div className="max-w-md">
        <RoleTimeline
          memberName="Jordan Lee"
          role="Vice President"
          avatarColor="#8b5cf6"
          tasks={tasks}
          compact={true}
        />
      </div>
    </div>
  );
}
