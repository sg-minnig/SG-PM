import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, CheckCircle2, XCircle, Edit2, FileText } from "lucide-react";

interface AIGeneratedTask {
  id: string;
  title: string;
  description: string;
  suggestedAssignee: string;
  suggestedDeadline: string;
  priority: string;
  approved: boolean | null;
}

export default function TaskReview() {
  const [selectedDoc] = useState("2023-2024_Transition_Document.pdf");
  const [tasks, setTasks] = useState<AIGeneratedTask[]>([
    {
      id: "1",
      title: "Schedule first executive meeting",
      description: "Coordinate calendars and book meeting room for initial team planning session",
      suggestedAssignee: "Alex Chen",
      suggestedDeadline: "2024-12-15",
      priority: "high",
      approved: null,
    },
    {
      id: "2",
      title: "Review last year's budget allocation",
      description: "Analyze previous year's spending to inform current budget planning",
      suggestedAssignee: "Sam Wilson",
      suggestedDeadline: "2024-12-18",
      priority: "high",
      approved: null,
    },
    {
      id: "3",
      title: "Update club constitution",
      description: "Review and revise club bylaws based on transition document recommendations",
      suggestedAssignee: "Jordan Lee",
      suggestedDeadline: "2024-12-25",
      priority: "medium",
      approved: null,
    },
    {
      id: "4",
      title: "Reach out to community partners",
      description: "Contact organizations mentioned in handover notes to maintain partnerships",
      suggestedAssignee: "Riley Martinez",
      suggestedDeadline: "2024-12-20",
      priority: "medium",
      approved: null,
    },
  ]);

  const [editingTask, setEditingTask] = useState<string | null>(null);

  const handleApprove = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, approved: true } : task
      )
    );
    console.log("Task approved:", taskId);
  };

  const handleReject = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, approved: false } : task
      )
    );
    console.log("Task rejected:", taskId);
  };

  const handleEdit = (taskId: string) => {
    setEditingTask(editingTask === taskId ? null : taskId);
  };

  const teamMembers = [
    "Alex Chen",
    "Jordan Lee",
    "Sam Wilson",
    "Taylor Kim",
    "Morgan Davis",
    "Casey Brown",
    "Riley Martinez",
    "Jamie Anderson",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold" data-testid="text-page-title">
          AI Task Review
        </h1>
        <p className="text-muted-foreground mt-1">
          Review and approve AI-generated tasks from your documents
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-5 w-5" />
              Document Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{selectedDoc}</span>
              </div>
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3 w-3" />
                Analyzed
              </Badge>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-sm mb-2">Key Excerpts:</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="p-3 bg-muted/50 rounded-md font-mono text-xs">
                    "The incoming executive team should prioritize scheduling their
                    first meeting within the first two weeks to establish communication
                    and delegate responsibilities..."
                  </p>
                  <p className="p-3 bg-muted/50 rounded-md font-mono text-xs">
                    "Budget review is critical - analyze last year's allocation to
                    identify areas for improvement and ensure sustainable spending..."
                  </p>
                  <p className="p-3 bg-muted/50 rounded-md font-mono text-xs">
                    "The club constitution needs updating to reflect recent policy
                    changes. This should be completed before the end of Q1..."
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-base">
                <Sparkles className="h-5 w-5 text-primary" />
                Generated Tasks ({tasks.length})
              </span>
              <Badge variant="outline">
                {tasks.filter((t) => t.approved === true).length} approved
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasks.map((task) => (
              <Card
                key={task.id}
                className={
                  task.approved === true
                    ? "border-chart-3"
                    : task.approved === false
                    ? "border-destructive opacity-60"
                    : ""
                }
                data-testid={`card-ai-task-${task.id}`}
              >
                <CardContent className="p-4 space-y-3">
                  {editingTask === task.id ? (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor={`title-${task.id}`}>Title</Label>
                        <Input
                          id={`title-${task.id}`}
                          defaultValue={task.title}
                          data-testid={`input-task-title-${task.id}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`desc-${task.id}`}>Description</Label>
                        <Textarea
                          id={`desc-${task.id}`}
                          defaultValue={task.description}
                          rows={3}
                          data-testid={`textarea-task-description-${task.id}`}
                        />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`assignee-${task.id}`}>Assignee</Label>
                          <Select defaultValue={task.suggestedAssignee}>
                            <SelectTrigger id={`assignee-${task.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {teamMembers.map((member) => (
                                <SelectItem key={member} value={member}>
                                  {member}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`deadline-${task.id}`}>Deadline</Label>
                          <Input
                            id={`deadline-${task.id}`}
                            type="date"
                            defaultValue={task.suggestedDeadline}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium" data-testid={`text-ai-task-title-${task.id}`}>
                          {task.title}
                        </h4>
                        <Badge
                          variant={
                            task.priority === "high"
                              ? "destructive"
                              : task.priority === "medium"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {task.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          <strong>Assignee:</strong> {task.suggestedAssignee}
                        </span>
                        <span>
                          <strong>Deadline:</strong> {task.suggestedDeadline}
                        </span>
                      </div>
                    </div>
                  )}

                  {task.approved === null && (
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(task.id)}
                        data-testid={`button-edit-${task.id}`}
                      >
                        <Edit2 className="h-3 w-3 mr-1" />
                        {editingTask === task.id ? "Done" : "Edit"}
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleApprove(task.id)}
                        data-testid={`button-approve-${task.id}`}
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(task.id)}
                        data-testid={`button-reject-${task.id}`}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}

                  {task.approved === true && (
                    <Badge variant="outline" className="gap-1 border-chart-3 text-chart-3">
                      <CheckCircle2 className="h-3 w-3" />
                      Approved
                    </Badge>
                  )}

                  {task.approved === false && (
                    <Badge variant="outline" className="gap-1 border-destructive text-destructive">
                      <XCircle className="h-3 w-3" />
                      Rejected
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
