import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, CheckCircle2 } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  avatarColor: string;
  tasksCount: number;
  completedTasks: number;
}

export default function Team() {
  const teamMembers: TeamMember[] = [
    {
      id: "1",
      name: "Alex Chen",
      role: "President",
      email: "alex.chen@university.edu",
      avatarColor: "#3b82f6",
      tasksCount: 8,
      completedTasks: 5,
    },
    {
      id: "2",
      name: "Jordan Lee",
      role: "Vice President",
      email: "jordan.lee@university.edu",
      avatarColor: "#8b5cf6",
      tasksCount: 6,
      completedTasks: 4,
    },
    {
      id: "3",
      name: "Sam Wilson",
      role: "Treasurer",
      email: "sam.wilson@university.edu",
      avatarColor: "#10b981",
      tasksCount: 7,
      completedTasks: 6,
    },
    {
      id: "4",
      name: "Taylor Kim",
      role: "Events Coordinator",
      email: "taylor.kim@university.edu",
      avatarColor: "#f59e0b",
      tasksCount: 9,
      completedTasks: 5,
    },
    {
      id: "5",
      name: "Morgan Davis",
      role: "Marketing Director",
      email: "morgan.davis@university.edu",
      avatarColor: "#ec4899",
      tasksCount: 5,
      completedTasks: 3,
    },
    {
      id: "6",
      name: "Casey Brown",
      role: "Social Media Manager",
      email: "casey.brown@university.edu",
      avatarColor: "#14b8a6",
      tasksCount: 6,
      completedTasks: 4,
    },
    {
      id: "7",
      name: "Riley Martinez",
      role: "Outreach Coordinator",
      email: "riley.martinez@university.edu",
      avatarColor: "#f97316",
      tasksCount: 4,
      completedTasks: 2,
    },
    {
      id: "8",
      name: "Jamie Anderson",
      role: "Secretary",
      email: "jamie.anderson@university.edu",
      avatarColor: "#06b6d4",
      tasksCount: 5,
      completedTasks: 4,
    },
  ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold" data-testid="text-page-title">
          Team
        </h1>
        <p className="text-muted-foreground mt-1">
          Meet your club executive team members
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {teamMembers.map((member) => (
          <Card
            key={member.id}
            className="hover-elevate"
            data-testid={`card-team-member-${member.id}`}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar
                  className="h-16 w-16"
                  style={{ backgroundColor: member.avatarColor }}
                >
                  <AvatarFallback
                    className="text-lg font-semibold"
                    style={{
                      backgroundColor: member.avatarColor,
                      color: "white",
                    }}
                  >
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-1">
                  <h3 className="font-semibold text-base" data-testid={`text-member-name-${member.id}`}>
                    {member.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {member.role}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <span className="text-xs truncate max-w-full">
                    {member.email}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Badge variant="secondary" className="gap-1">
                    {member.tasksCount} tasks
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {member.completedTasks}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
