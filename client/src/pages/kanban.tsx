import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import type { TeamMember, CustomTimelineTask } from "@shared/schema";

export default function Kanban() {
  const { user } = useAuth();
  
  const { data: teamMembers = [], isLoading: loadingMembers } = useQuery<TeamMember[]>({
    queryKey: ["/api/team-members"],
  });

  // Find current user's team member data
  const currentMember = teamMembers.find(m => m.email.toLowerCase() === user?.email?.toLowerCase());
  
  // Fetch current user's timeline tasks
  const { data: myTimelineTasks = [], isLoading: loadingMyTasks } = useQuery<CustomTimelineTask[]>({
    queryKey: ["/api/timeline-tasks", currentMember?.id],
    enabled: !!currentMember?.id,
  });

  // Fetch timeline tasks for all team members (to show what they're working on)
  const { data: allMemberTasks = {}, isLoading: loadingAllTasks } = useQuery<Record<string, CustomTimelineTask[]>>({
    queryKey: ["/api/all-timeline-tasks", { memberIds: teamMembers.map(m => m.id).sort(), currentMemberId: currentMember?.id }],
    queryFn: async ({ queryKey }) => {
      const tasksByMember: Record<string, CustomTimelineTask[]> = {};
      
      // Extract member IDs from queryKey to avoid stale closures
      const { memberIds, currentMemberId } = queryKey[1] as { memberIds: string[], currentMemberId?: string };
      const otherMemberIds = memberIds.filter(id => id !== currentMemberId);
      
      // Parallelize all fetch requests
      const fetchPromises = otherMemberIds.map(async (memberId) => {
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
    enabled: teamMembers.length > 0 && !!currentMember,
  });

  // Get the current work and status for a team member
  const getCurrentWork = (memberId: string): { title: string; status: string } => {
    const tasks = allMemberTasks[memberId] || [];
    const inProgressTask = tasks.find((t: CustomTimelineTask) => t.status === "in-progress");
    if (inProgressTask) return { title: inProgressTask.title, status: "in-progress" };
    
    const upcomingTask = tasks.find((t: CustomTimelineTask) => t.status === "upcoming");
    if (upcomingTask) return { title: upcomingTask.title, status: "upcoming" };
    
    return { title: "No active tasks", status: "none" };
  };

  const completedTasks = myTimelineTasks.filter((t: CustomTimelineTask) => t.status === "completed").length;
  const progressPercentage = myTimelineTasks.length > 0 ? (completedTasks / myTimelineTasks.length) * 100 : 0;

  const getStatusIcon = (status: string) => {
    if (status === "completed") return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    if (status === "in-progress") return <Clock className="h-5 w-5 text-blue-600" />;
    return <Circle className="h-5 w-5 text-muted-foreground" />;
  };

  const isLoading = loadingMembers || loadingMyTasks || loadingAllTasks;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Handle case where user doesn't have a linked team member record
  if (!loadingMembers && !currentMember) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="text-page-title">
            My Progress
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your timeline and see what your team is working on
          </p>
        </div>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-12 pb-12 text-center">
            <Circle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Team Member Profile Not Found</h3>
            <p className="text-muted-foreground mb-4">
              Your account ({user?.email}) hasn't been linked to a team member profile yet.
            </p>
            <p className="text-sm text-muted-foreground/80">
              Please ask your team president to add you as a team member with your email address.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold" data-testid="text-page-title">
          My Progress
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your timeline and see what your team is working on
        </p>
      </div>

      {/* Personal Timeline Section */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10" style={{ backgroundColor: currentMember?.avatarColor || "#3b82f6" }}>
                {currentMember?.profileImageUrl ? (
                  <AvatarImage src={currentMember.profileImageUrl} alt={currentMember.name} />
                ) : (
                  <AvatarFallback style={{ backgroundColor: currentMember?.avatarColor || "#3b82f6", color: "white" }}>
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <CardTitle className="text-lg">Your Timeline</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {currentMember?.position || "Team Member"}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm">
              {completedTasks}/{myTimelineTasks.length} Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {myTimelineTasks.length === 0 ? (
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
                {myTimelineTasks.map((task, index) => (
                  <div
                    key={task.id}
                    className={`flex items-start gap-4 pb-4 ${
                      index < myTimelineTasks.length - 1 ? "border-b border-border" : ""
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

      {/* Team Members Working Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold">What Your Team is Working On</h2>
          <p className="text-muted-foreground mt-1">
            See current work across all team members
          </p>
        </div>

        {teamMembers.filter(m => m.email.toLowerCase() !== user?.email?.toLowerCase()).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No other team members yet</p>
            <p className="text-sm text-muted-foreground/80 mt-1">
              Add team members on the Team Setup page
            </p>
          </div>
        ) : (
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-4 pb-4">
              {teamMembers
                .filter(member => member.email.toLowerCase() !== user?.email?.toLowerCase())
                .map((member) => (
                <Card key={member.id} className="border-0 shadow-sm w-80 flex-shrink-0">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12" style={{ backgroundColor: member.avatarColor }}>
                        {member.profileImageUrl ? (
                          <AvatarImage src={member.profileImageUrl} alt={member.name} />
                        ) : (
                          <AvatarFallback style={{ backgroundColor: member.avatarColor, color: "white" }}>
                            {member.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{member.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{member.position}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {(() => {
                        const work = getCurrentWork(member.id);
                        return (
                          <>
                            <div className="flex items-center gap-2">
                              {work.status === "in-progress" ? (
                                <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" />
                              ) : work.status === "upcoming" ? (
                                <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              ) : (
                                <Circle className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
                              )}
                              <span className="text-sm">
                                {work.status === "in-progress" ? "Currently working on:" :
                                 work.status === "upcoming" ? "Next up:" : "Status:"}
                              </span>
                            </div>
                            <p className="text-sm font-medium pl-6">
                              {work.title}
                            </p>
                            <div className="pl-6">
                              <Badge 
                                variant={
                                  work.status === "in-progress" ? "default" :
                                  work.status === "upcoming" ? "outline" : "secondary"
                                }
                                className="text-xs"
                              >
                                {work.status === "in-progress" ? "In Progress" :
                                 work.status === "upcoming" ? "Upcoming" : "No Tasks"}
                              </Badge>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
