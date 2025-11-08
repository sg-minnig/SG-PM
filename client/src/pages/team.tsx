import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, User2, Phone, Instagram } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { TeamMember } from "@shared/schema";

export default function Team() {
  const { data: teamMembers = [], isLoading } = useQuery<TeamMember[]>({
    queryKey: ["/api/team-members"],
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : teamMembers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No team members yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {teamMembers.map((member) => (
            <Card
              key={member.id}
              className="hover-elevate"
              data-testid={`card-team-member-${member.id}`}
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <Avatar
                    className="h-20 w-20"
                    style={{ backgroundColor: member.avatarColor }}
                  >
                    {member.profileImageUrl ? (
                      <AvatarImage src={member.profileImageUrl} alt={member.name} />
                    ) : (
                      <AvatarFallback
                        className="text-xl font-semibold"
                        style={{
                          backgroundColor: member.avatarColor,
                          color: "white",
                        }}
                      >
                        {getInitials(member.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <div className="space-y-1 w-full">
                    <h3 className="font-semibold text-base" data-testid={`text-member-name-${member.id}`}>
                      {member.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {member.position}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-muted-foreground w-full">
                    <Mail className="h-3 w-3 flex-shrink-0" />
                    <span className="text-xs truncate">
                      {member.email}
                    </span>
                  </div>

                  {member.phone && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground w-full">
                      <Phone className="h-3 w-3 flex-shrink-0" />
                      <span className="text-xs truncate">
                        {member.phone}
                      </span>
                    </div>
                  )}

                  {member.instagram && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground w-full">
                      <Instagram className="h-3 w-3 flex-shrink-0" />
                      <a 
                        href={`https://instagram.com/${member.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs truncate hover:text-primary transition-colors"
                      >
                        {member.instagram}
                      </a>
                    </div>
                  )}

                  {member.advisorName && (
                    <div className="flex flex-col gap-0.5 text-sm text-muted-foreground/80 w-full pt-1 border-t border-border">
                      <div className="flex items-center gap-1">
                        <User2 className="h-3 w-3 flex-shrink-0" />
                        <span className="text-xs truncate">
                          Advisor: {member.advisorName}
                        </span>
                      </div>
                      {member.advisorEmail && (
                        <span className="text-xs truncate ml-4 text-muted-foreground/60">
                          {member.advisorEmail}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
