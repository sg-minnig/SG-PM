// Team setup page for presidents to create and manage team members
import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { TeamMember } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Trash2, Upload, X } from "lucide-react";

export default function TeamSetup() {
  const { user, isPresident } = useAuth();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    position: "",
    advisorName: "",
    advisorEmail: "",
    email: "",
    avatarColor: "#3b82f6",
    profileImageUrl: null as string | null,
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        advisorName: "",
        advisorEmail: "",
        email: "",
        avatarColor: "#3b82f6",
        profileImageUrl: null,
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be under 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadingImage(true);
    try {
      // Get presigned upload URL
      const response = await apiRequest(
        "POST",
        "/api/profile-image/upload-url",
        {}
      );
      const data = await response.json() as { uploadURL: string; objectPath: string };
      const { uploadURL, objectPath } = data;

      // Upload file to object storage
      const uploadResponse = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload failed");
      }

      // Update member data with image path
      setNewMember({ ...newMember, profileImageUrl: objectPath });
      
      toast({
        title: "Image uploaded",
        description: "Profile image uploaded successfully.",
      });
    } catch (error) {
      console.error("Image upload error:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image.",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
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
                  <Label htmlFor="advisorName">Advisor Name</Label>
                  <Input
                    id="advisorName"
                    value={newMember.advisorName}
                    onChange={(e) => setNewMember({ ...newMember, advisorName: e.target.value })}
                    placeholder="Dr. Sarah Martinez"
                    data-testid="input-advisor-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="advisorEmail">Advisor Email</Label>
                  <Input
                    id="advisorEmail"
                    type="email"
                    value={newMember.advisorEmail}
                    onChange={(e) => setNewMember({ ...newMember, advisorEmail: e.target.value })}
                    placeholder="sarah.martinez@university.edu"
                    data-testid="input-advisor-email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Profile Photo (optional)</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20" style={{ backgroundColor: newMember.avatarColor }}>
                    {newMember.profileImageUrl ? (
                      <AvatarImage src={newMember.profileImageUrl} alt={newMember.name} />
                    ) : (
                      <AvatarFallback
                        style={{ backgroundColor: newMember.avatarColor, color: "white" }}
                        className="text-2xl font-medium"
                      >
                        {newMember.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2) || "?"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex flex-col gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      data-testid="button-upload-image"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploadingImage ? "Uploading..." : "Upload Photo"}
                    </Button>
                    {newMember.profileImageUrl && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setNewMember({ ...newMember, profileImageUrl: null })}
                        data-testid="button-remove-image"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Avatar Color (used if no photo uploaded)</Label>
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
                <Button type="submit" disabled={createMemberMutation.isPending || uploadingImage} data-testid="button-save-member">
                  {createMemberMutation.isPending ? "Adding..." : uploadingImage ? "Uploading image..." : "Add Member"}
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
                      {member.profileImageUrl ? (
                        <AvatarImage src={member.profileImageUrl} alt={member.name} />
                      ) : (
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
                      )}
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">{member.position}</p>
                      {member.advisorName && (
                        <div className="text-xs text-muted-foreground/80 mt-1 space-y-0.5">
                          <p>Advisor: {member.advisorName}</p>
                          {member.advisorEmail && (
                            <p className="truncate">{member.advisorEmail}</p>
                          )}
                        </div>
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
