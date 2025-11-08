import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { Sparkles, CheckCircle2, XCircle, Edit2, FileText, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Task, Document as DocType } from "@shared/schema";

interface TeamMember {
  id: string;
  name: string;
  position: string;
}

export default function TaskReview() {
  const { toast } = useToast();
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<{
    title: string;
    description: string;
    priority: string;
  } | null>(null);

  // Fetch AI-generated tasks
  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  // Fetch documents
  const { data: documents = [] } = useQuery<DocType[]>({
    queryKey: ["/api/documents"],
  });

  // Fetch team members
  const { data: teamMembers = [] } = useQuery<TeamMember[]>({
    queryKey: ["/api/team-members"],
  });

  // Filter for AI-generated tasks only
  const aiTasks = tasks.filter(task => task.aiGenerated);
  const pendingTasks = aiTasks.filter(task => !task.approved);
  const approvedTasks = aiTasks.filter(task => task.approved);

  // Approve task mutation
  const approveMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates?: Partial<Task> }) => {
      return await apiRequest(`/api/tasks/${id}`, "PATCH", {
        ...updates,
        approved: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setEditingTask(null);
      setEditedData(null);
      toast({
        title: "Task Approved",
        description: "Task has been added to timelines",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Approval Failed",
        description: "Failed to approve task",
      });
    },
  });

  // Delete task mutation
  const deleteMutation = useMutation({
    mutationFn: async (taskId: string) => {
      return await apiRequest(`/api/tasks/${taskId}`, "DELETE", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task Rejected",
        description: "Task has been removed",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Rejection Failed",
        description: "Failed to reject task",
      });
    },
  });

  const handleApprove = (task: Task) => {
    const updates = editingTask === task.id && editedData ? editedData : {};
    approveMutation.mutate({ id: task.id, updates });
  };

  const handleReject = (taskId: string) => {
    deleteMutation.mutate(taskId);
  };

  const handleEdit = (task: Task) => {
    if (editingTask === task.id) {
      setEditingTask(null);
      setEditedData(null);
    } else {
      setEditingTask(task.id);
      setEditedData({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
      });
    }
  };

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

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading tasks...
        </div>
      ) : aiTasks.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center min-h-72 p-12">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 mb-6">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              No AI tasks yet
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
              Upload documents and analyze them with AI to generate tasks
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-5 w-5" />
                Analyzed Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {documents.filter(doc => doc.analyzed).map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm font-medium truncate">{doc.name}</span>
                  </div>
                  <Badge variant="secondary" className="gap-1 flex-shrink-0">
                    <Sparkles className="h-3 w-3" />
                    {doc.position}
                  </Badge>
                </div>
              ))}
              {documents.filter(doc => doc.analyzed).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No analyzed documents yet
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-base">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Generated Tasks ({aiTasks.length})
                </span>
                <Badge variant="outline">
                  {approvedTasks.length} approved
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiTasks.map((task) => (
                <Card
                  key={task.id}
                  className={
                    task.approved
                      ? "border-chart-3"
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
                            value={editedData?.title || ""}
                            onChange={(e) => setEditedData(prev => prev ? { ...prev, title: e.target.value } : null)}
                            data-testid={`input-task-title-${task.id}`}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`desc-${task.id}`}>Description</Label>
                          <Textarea
                            id={`desc-${task.id}`}
                            value={editedData?.description || ""}
                            onChange={(e) => setEditedData(prev => prev ? { ...prev, description: e.target.value } : null)}
                            rows={3}
                            data-testid={`textarea-task-description-${task.id}`}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`priority-${task.id}`}>Priority</Label>
                          <Select 
                            value={editedData?.priority || "medium"}
                            onValueChange={(value) => setEditedData(prev => prev ? { ...prev, priority: value } : null)}
                          >
                            <SelectTrigger id={`priority-${task.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                          </Select>
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
                            className="text-xs flex-shrink-0"
                          >
                            {task.priority}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {task.position}
                          </Badge>
                        </div>
                      </div>
                    )}

                    {!task.approved && (
                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(task)}
                          data-testid={`button-edit-${task.id}`}
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          {editingTask === task.id ? "Cancel" : "Edit"}
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApprove(task)}
                          disabled={approveMutation.isPending}
                          data-testid={`button-approve-${task.id}`}
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(task.id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-reject-${task.id}`}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}

                    {task.approved && (
                      <Badge variant="outline" className="gap-1 border-chart-3 text-chart-3">
                        <CheckCircle2 className="h-3 w-3" />
                        Approved
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
