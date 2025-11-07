// Team setup page for presidents to create and manage team members
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { TeamMember } from "@shared/schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Trash2 } from "lucide-react";

export default function TeamSetup() {
  const { user, isPresident } = useAuth();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    position: "",
    advisor: "",
    email: "",
    avatarColor: "#3b82f6",
  });

  const { data: teamMembers = [], isLoading } = useQuery<TeamMember[]>({
    queryKey: ["/api/team-members"],
  });

  const createMemberMutation = useMutation({
    mutationFn: async (memberData: typeof newMember) => {
      // Don't include userId - it will be linked when the person logs in
      return apiRequest("POST", "/api/team-members", memberData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team-members"] });
      toast({
        title: "Team member added",
        description: "The team member has been successfully added.",
      });
      setNewMember({
        name: "",
        position: "",
        advisor: "",
        email: "",
        avatarColor: "#3b82f6",
      });
      setIsAdding(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add team member.",
        variant: "destructive",
      });
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/team-members/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team-members"] });
      toast({
        title: "Team member removed",
        description: "The team member has been removed from the team.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMemberMutation.mutate(newMember);
  };

  const colors = [
    "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899", "#14b8a6",
  ];

  if (!isPresident) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight">Team Setup</h1>
          <p className="text-lg text-muted-foreground">
            Only presidents can manage the team
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight" data-testid="text-page-title">
          Team Setup
        </h1>
        <p className="text-lg text-muted-foreground">
          Add and manage your executive team members
        </p>
      </div>

      {/* Add Team Member Form */}
      {isAdding ? (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Add New Team Member</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    placeholder="Alex Chen"
                    required
                    data-testid="input-member-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position *</Label>
                  <Input
                    id="position"
                    value={newMember.position}
                    onChange={(e) => setNewMember({ ...newMember, position: e.target.value })}
                    placeholder="President"
                    required
                    data-testid="input-member-position"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    placeholder="alex@club.org"
                    required
                    data-testid="input-member-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="advisor">Advisor</Label>
                  <Input
                    id="advisor"
                    value={newMember.advisor}
                    onChange={(e) => setNewMember({ ...newMember, advisor: e.target.value })}
                    placeholder="Dr. Sarah Martinez"
                    data-testid="input-member-advisor"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Avatar Color</Label>
                <div className="flex gap-3">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewMember({ ...newMember, avatarColor: color })}
                      className={`h-10 w-10 rounded-full border-2 transition-all ${
                        newMember.avatarColor === color ? "border-foreground scale-110" : "border-border"
                      }`}
                      style={{ backgroundColor: color }}
                      data-testid={`button-color-${color.replace("#", "")}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={createMemberMutation.isPending} data-testid="button-save-member">
                  {createMemberMutation.isPending ? "Adding..." : "Add Member"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAdding(false)}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Button onClick={() => setIsAdding(true)} data-testid="button-add-member">
          <Plus className="h-4 w-4 mr-2" />
          Add Team Member
        </Button>
      )}

      {/* Team Members List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : teamMembers.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No team members yet. Add your first member above!</p>
          </div>
        ) : (
          teamMembers.map((member) => (
            <Card key={member.id} className="border-0 shadow-sm" data-testid={`card-member-${member.id}`}>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12" style={{ backgroundColor: member.avatarColor }}>
                      <AvatarFallback
                        style={{ backgroundColor: member.avatarColor, color: "white" }}
                        className="text-sm font-medium"
                      >
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">{member.position}</p>
                      {member.advisor && (
                        <p className="text-xs text-muted-foreground/80 mt-1">
                          Advisor: {member.advisor}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMemberMutation.mutate(member.id)}
                    disabled={deleteMemberMutation.isPending}
                    data-testid={`button-delete-${member.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  {member.email}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
