import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, GripVertical } from "lucide-react";
import { format } from "date-fns";

interface TaskCardProps {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: "low" | "medium" | "high";
  assignee?: {
    name: string;
    avatarColor: string;
  };
  deadline?: Date;
  aiGenerated?: boolean;
  isDragging?: boolean;
}

const priorityColors = {
  low: "border-l-chart-3",
  medium: "border-l-chart-2",
  high: "border-l-chart-4",
};

const statusColors: Record<string, string> = {
  "not-started": "secondary",
  "in-progress": "default",
  completed: "outline",
};

export function TaskCard({
  id,
  title,
  description,
  status,
  priority,
  assignee,
  deadline,
  aiGenerated,
  isDragging = false,
}: TaskCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card
      className={`p-5 border-0 shadow-sm border-l-4 ${priorityColors[priority]} hover-elevate ${
        isDragging ? "opacity-50" : ""
      }`}
      data-testid={`card-task-${id}`}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-base line-clamp-2" data-testid={`text-task-title-${id}`}>
              {title}
            </h4>
            {description && (
              <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">
                {description}
              </p>
            )}
          </div>
          <GripVertical className="h-5 w-5 text-muted-foreground/40 flex-shrink-0 cursor-grab" />
        </div>

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2.5">
            {assignee && (
              <Avatar className="h-7 w-7" style={{ backgroundColor: assignee.avatarColor }}>
                <AvatarFallback
                  className="text-xs font-medium"
                  style={{ backgroundColor: assignee.avatarColor, color: "white" }}
                >
                  {getInitials(assignee.name)}
                </AvatarFallback>
              </Avatar>
            )}
            {deadline && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>{format(deadline, "MMM d")}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {aiGenerated && (
              <Badge variant="secondary" className="text-xs">
                AI
              </Badge>
            )}
            <Badge variant={statusColors[status] as any} className="text-xs capitalize">
              {status.replace("-", " ")}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}
