import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle2, Circle, Clock, Sparkles } from "lucide-react";
import { AddCustomTaskDialog } from "./add-custom-task-dialog";
import { useToast } from "@/hooks/use-toast";

interface TimelineTask {
  id: string;
  title: string;
  status: "completed" | "in-progress" | "upcoming";
  order: number;
  isCustom?: boolean;
}

interface RoleTimelineProps {
  memberName: string;
  role: string;
  avatarColor: string;
  tasks: TimelineTask[];
  compact?: boolean;
  memberId?: string;
  onTaskAdded?: (task: { title: string; status: string; order: number }) => void;
}

export function RoleTimeline({
  memberName,
  role,
  avatarColor,
  tasks,
  compact = false,
  memberId,
  onTaskAdded,
}: RoleTimelineProps) {
  const { toast } = useToast();
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const currentTask = tasks.find((t) => t.status === "in-progress");
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const progress = (completedCount / tasks.length) * 100;

  const handleAddTask = (task: { title: string; status: string; order: number }) => {
    if (onTaskAdded) {
      onTaskAdded(task);
      toast({
        title: "Task added",
        description: `"${task.title}" has been added to your timeline.`,
      });
    }
  };

  if (compact) {
    return (
      <div className="space-y-3" data-testid={`timeline-compact-${memberName.toLowerCase().replace(/\s+/g, '-')}`}>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10" style={{ backgroundColor: avatarColor }}>
            <AvatarFallback
              className="text-sm font-medium"
              style={{ backgroundColor: avatarColor, color: "white" }}
            >
              {getInitials(memberName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm">{memberName}</h4>
            <p className="text-xs text-muted-foreground">{role}</p>
          </div>
          <Badge variant="secondary" className="text-xs">
            {completedCount}/{tasks.length}
          </Badge>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {currentTask && (
          <div className="flex items-start gap-2 p-2 bg-primary/5 rounded-md border-l-2 border-primary">
            <Clock className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium">Currently working on:</p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {currentTask.title}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="border-0 shadow-sm" data-testid={`timeline-full-${memberName.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-4 flex-wrap">
          <Avatar className="h-14 w-14" style={{ backgroundColor: avatarColor }}>
            <AvatarFallback
              className="text-lg font-medium"
              style={{ backgroundColor: avatarColor, color: "white" }}
            >
              {getInitials(memberName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg">{memberName}</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">{role}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-medium">
              {completedCount}/{tasks.length} complete
            </Badge>
            {onTaskAdded && (
              <AddCustomTaskDialog
                memberName={memberName}
                currentTaskCount={tasks.length}
                hasCurrentTask={!!currentTask}
                onAddTask={handleAddTask}
              />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Timeline Progress</span>
            <span className="font-semibold">{Math.round(progress)}%</span>
          </div>
          <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="space-y-4">
          {tasks.map((task, index) => (
            <div
              key={task.id}
              className="flex items-start gap-3"
              data-testid={`timeline-task-${task.id}`}
            >
              <div className="flex flex-col items-center">
                {task.status === "completed" ? (
                  <CheckCircle2 className="h-5 w-5 text-chart-3 flex-shrink-0" />
                ) : task.status === "in-progress" ? (
                  <Clock className="h-5 w-5 text-primary flex-shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/50 flex-shrink-0" />
                )}
                {index < tasks.length - 1 && (
                  <div
                    className={`w-0.5 h-10 mt-1.5 ${
                      task.status === "completed"
                        ? "bg-chart-3/30"
                        : "bg-border"
                    }`}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-start gap-2">
                  <p
                    className={`text-sm font-medium flex-1 ${
                      task.status === "completed"
                        ? "text-muted-foreground line-through"
                        : task.status === "in-progress"
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {task.title}
                  </p>
                  {task.isCustom && (
                    <Badge variant="outline" className="text-xs gap-1 flex-shrink-0">
                      <Sparkles className="h-3 w-3" />
                      Custom
                    </Badge>
                  )}
                </div>
                {task.status === "in-progress" && (
                  <Badge variant="secondary" className="mt-1.5 text-xs">
                    In Progress
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
