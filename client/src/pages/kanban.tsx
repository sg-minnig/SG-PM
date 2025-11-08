import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import type { TeamMember, CustomTimelineTask } from "@shared/schema";

export default function Kanban() {
  const { user } = useAuth();
  
  const { data: teamMembers = [], isLoading: loadingMembers } = useQuery<TeamMember[]>({
    queryKey: ["/api/team-members"],
  });

  // Find current user's team member data
  const currentMember = teamMembers.find(m => m.email.toLowerCase() === user?.email?.toLowerCase());
  
  // Fetch timeline tasks for all team members (unified data source)
  const { data: allMemberTasks = {}, isLoading: loadingAllTasks } = useQuery<Record<string, CustomTimelineTask[]>>({
    queryKey: ["/api/all-timeline-tasks", { memberIds: teamMembers.map(m => m.id).sort() }],
    queryFn: async ({ queryKey }) => {
      const tasksByMember: Record<string, CustomTimelineTask[]> = {};
      
      // Extract member IDs from queryKey to avoid stale closures
      const { memberIds } = queryKey[1] as { memberIds: string[] };
      
      // Parallelize all fetch requests for ALL members
      const fetchPromises = memberIds.map(async (memberId) => {
        const response = await fetch(`/api/timeline-tasks/${memberId}`, {
          credentials: "include",
        });
        if (response.ok) {
          tasksByMember[memberId] = await response.json();
        }
      });
      
      await Promise.all(fetchPromises);
      return tasksByMember;
    },
    enabled: teamMembers.length > 0,
  });

  // Calculate progress for a team member
  const getMemberProgress = (memberId: string) => {
    const tasks = allMemberTasks[memberId] || [];
    const completed = tasks.filter((t: CustomTimelineTask) => t.status === "completed").length;
    const percentage = tasks.length > 0 ? (completed / tasks.length) * 100 : 0;
    return { completed, total: tasks.length, percentage };
  };

  // Use unified data source for current user's tasks
  const myTasks = currentMember?.id ? (allMemberTasks[currentMember.id] || []) : [];
  const completedTasks = myTasks.filter((t: CustomTimelineTask) => t.status === "completed").length;
  const progressPercentage = myTasks.length > 0 ? (completedTasks / myTasks.length) * 100 : 0;

  const getStatusIcon = (status: string) => {
    if (status === "completed") return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    if (status === "in-progress") return <Clock className="h-5 w-5 text-blue-600" />;
    return <Circle className="h-5 w-5 text-muted-foreground" />;
  };

  const isLoading = loadingMembers || loadingAllTasks;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold" data-testid="text-page-title">
          {currentMember ? "My Progress" : "Team Progress"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {currentMember 
            ? "Track your timeline and see what your team is working on"
            : "View timeline progress for all team members"}
        </p>
      </div>

      {/* Personal Timeline Section - Only show if user has a linked profile */}
      {currentMember && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10" style={{ backgroundColor: currentMember.avatarColor || "#3b82f6" }}>
                  {currentMember.profileImageUrl ? (
                    <AvatarImage src={currentMember.profileImageUrl} alt={currentMember.name} />
                  ) : (
                    <AvatarFallback style={{ backgroundColor: currentMember.avatarColor || "#3b82f6", color: "white" }}>
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <CardTitle className="text-lg">Your Timeline</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {currentMember.position || "Team Member"}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="text-sm">
                {completedTasks}/{myTasks.length} Complete
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {myTasks.length === 0 ? (
              <div className="text-center py-12">
                <Circle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No timeline tasks yet</p>
                <p className="text-sm text-muted-foreground/80 mt-1">
                  Visit the Role Timelines page to create your personal timeline
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Overall Progress</span>
                    <span className="font-medium">{Math.round(progressPercentage)}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>

                <div className="space-y-4">
                  {myTasks.map((task, index) => (
                    <div
                      key={task.id}
                      className={`flex items-start gap-4 pb-4 ${
                        index < myTasks.length - 1 ? "border-b border-border" : ""
                      }`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {getStatusIcon(task.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${
                          task.status === "completed" ? "text-muted-foreground line-through" : ""
                        }`}>
                          {task.title}
                        </p>
                        <Badge 
                          variant={
                            task.status === "completed" ? "secondary" :
                            task.status === "in-progress" ? "default" : "outline"
                          }
                          className="mt-1 text-xs"
                        >
                          {task.status === "completed" ? "Completed" :
                           task.status === "in-progress" ? "In Progress" : "Upcoming"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Team Members Timeline Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold">
            {currentMember ? "Team Progress" : "All Team Members"}
          </h2>
          <p className="text-muted-foreground mt-1">
            {currentMember 
              ? "See timeline progress for all team members"
              : "Timeline progress for everyone on the team"}
          </p>
        </div>

        {(() => {
          // Show all members EXCEPT the current user (if they have a profile)
          const otherMembers = currentMember
            ? teamMembers.filter(m => m.id !== currentMember.id)
            : teamMembers;
          
          if (otherMembers.length === 0) {
            return (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {currentMember ? "No other team members yet" : "No team members yet"}
                </p>
                <p className="text-sm text-muted-foreground/80 mt-1">
                  Add team members on the Team Setup page
                </p>
              </div>
            );
          }
          
          return (
            <div className="space-y-4">
              {otherMembers.map((member) => {
                const tasks = allMemberTasks[member.id] || [];
                const progress = getMemberProgress(member.id);
                
                return (
                  <Card key={member.id} className="border-0 shadow-sm">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10" style={{ backgroundColor: member.avatarColor }}>
                            {member.profileImageUrl ? (
                              <AvatarImage src={member.profileImageUrl} alt={member.name} />
                            ) : (
                              <AvatarFallback style={{ backgroundColor: member.avatarColor, color: "white" }}>
                                {member.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{member.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{member.position}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-sm">
                          {progress.completed}/{progress.total} Complete
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {tasks.length === 0 ? (
                        <div className="text-center py-8">
                          <Circle className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No timeline tasks yet</p>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">{Math.round(progress.percentage)}%</span>
                            </div>
                            <Progress value={progress.percentage} className="h-2" />
                          </div>

                          <div className="space-y-4">
                            {tasks.map((task, index) => (
                              <div
                                key={task.id}
                                className={`flex items-start gap-4 pb-4 ${
                                  index < tasks.length - 1 ? "border-b border-border" : ""
                                }`}
                              >
                                <div className="flex-shrink-0 mt-0.5">
                                  {getStatusIcon(task.status)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`font-medium ${
                                    task.status === "completed" ? "text-muted-foreground line-through" : ""
                                  }`}>
                                    {task.title}
                                  </p>
                                  <Badge 
                                    variant={
                                      task.status === "completed" ? "secondary" :
                                      task.status === "in-progress" ? "default" : "outline"
                                    }
                                    className="mt-1 text-xs"
                                  >
                                    {task.status === "completed" ? "Completed" :
                                     task.status === "in-progress" ? "In Progress" : "Upcoming"}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
