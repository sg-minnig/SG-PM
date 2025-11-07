import { useQuery, useMutation } from "@tanstack/react-query";
import { RoleTimeline } from "@/components/role-timeline";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { CustomTimelineTask } from "@shared/schema";

interface TimelineTask {
  id: string;
  title: string;
  status: "completed" | "in-progress" | "upcoming";
  order: number;
  isCustom?: boolean;
}

interface RoleTimelineData {
  memberName: string;
  role: string;
  avatarColor: string;
  memberId: string;
  tasks: TimelineTask[];
}

export default function TeamTimelines() {
  const addTaskMutation = useMutation({
    mutationFn: async (data: { memberId: string; title: string; status: string; order: string }) => {
      const response = await apiRequest('POST', '/api/timeline-tasks', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/timeline-tasks'] });
    },
  });

  const handleAddTask = (memberId: string) => (task: { title: string; status: string; order: number }) => {
    addTaskMutation.mutate({
      memberId,
      title: task.title,
      status: task.status,
      order: task.order.toString(),
    });
  };

  const baseRoleTimelines: RoleTimelineData[] = [
    {
      memberName: "Alex Chen",
      role: "President",
      avatarColor: "#3b82f6",
      memberId: "member-1",
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
      memberId: "member-2",
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
      memberId: "member-3",
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
      memberId: "member-4",
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
      memberId: "member-5",
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
      memberId: "member-6",
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
        {baseRoleTimelines.map((timeline) => {
          const { data: customTasksData } = useQuery<CustomTimelineTask[]>({
            queryKey: ['/api/timeline-tasks', timeline.memberId],
          });

          const customTasks: TimelineTask[] = (customTasksData || []).map(task => ({
            id: task.id,
            title: task.title,
            status: task.status as "completed" | "in-progress" | "upcoming",
            order: parseFloat(task.order),
            isCustom: true,
          }));

          const allTasks = [...timeline.tasks, ...customTasks].sort((a, b) => a.order - b.order);

          return (
            <div key={timeline.memberName} className="border-0 shadow-sm">
              <RoleTimeline
                {...timeline}
                tasks={allTasks}
                onTaskAdded={handleAddTask(timeline.memberId)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
