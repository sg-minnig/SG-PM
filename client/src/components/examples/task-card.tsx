import { TaskCard } from "../task-card";

export default function TaskCardExample() {
  return (
    <div className="p-6 bg-background max-w-sm">
      <TaskCard
        id="1"
        title="Review transition documents from previous year"
        description="Analyze key handover notes and identify action items for the upcoming semester."
        status="in-progress"
        priority="high"
        assignee={{
          name: "Sarah Johnson",
          avatarColor: "#3b82f6",
        }}
        deadline={new Date(2024, 11, 15)}
        aiGenerated={true}
      />
    </div>
  );
}
