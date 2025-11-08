import { useState, useRef, useEffect } from "react";
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
import { Upload, X } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: teamMembers = [] } = useQuery<TeamMember[]>({
    queryKey: ["/api/team-members"],
  });

  const myProfile = teamMembers.find((m) => m.userId === user?.id);

  const [profileData, setProfileData] = useState({
    name: "",
    position: "",
    email: "",
    phone: "",
    instagram: "",
    advisorName: "",
    advisorEmail: "",
    avatarColor: "#3b82f6",
    profileImageUrl: null as string | null,
  });

  useEffect(() => {
    if (myProfile) {
      setProfileData({
        name: myProfile.name,
        position: myProfile.position,
        email: myProfile.email,
        phone: myProfile.phone || "",
        instagram: myProfile.instagram || "",
        advisorName: myProfile.advisorName || "",
        advisorEmail: myProfile.advisorEmail || "",
        avatarColor: myProfile.avatarColor,
        profileImageUrl: myProfile.profileImageUrl || null,
      });
    }
  }, [myProfile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof profileData) => {
      if (!myProfile) throw new Error("Profile not found");
      return apiRequest("PATCH", `/api/team-members/${myProfile.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team-members"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
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
      const response = await apiRequest(
        "POST",
        "/api/profile-image/upload-url",
        {}
      );
      const data = await response.json() as { uploadURL: string; objectPath: string };
      const { uploadURL, objectPath } = data;

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

      setProfileData({ ...profileData, profileImageUrl: objectPath });
      
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

  if (!user) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight">My Profile</h1>
          <p className="text-lg text-muted-foreground">
            Please log in to view your profile
          </p>
        </div>
      </div>
    );
  }

  if (!myProfile) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight" data-testid="text-page-title">
            My Profile
          </h1>
          <p className="text-lg text-muted-foreground">
            Your profile hasn't been created yet. Contact a president to add you to the team.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight" data-testid="text-page-title">
          My Profile
        </h1>
        <p className="text-lg text-muted-foreground">
          Update your information and profile photo
        </p>
      </div>

      <Card className="border-0 shadow-sm max-w-3xl">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder="Alex Chen"
                  required
                  data-testid="input-profile-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position *</Label>
                <Input
                  id="position"
                  value={profileData.position}
                  onChange={(e) => setProfileData({ ...profileData, position: e.target.value })}
                  placeholder="Vice President"
                  required
                  data-testid="input-profile-position"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  placeholder="alex@club.org"
                  required
                  data-testid="input-profile-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                  data-testid="input-profile-phone"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram Handle</Label>
                <Input
                  id="instagram"
                  value={profileData.instagram}
                  onChange={(e) => setProfileData({ ...profileData, instagram: e.target.value })}
                  placeholder="@username"
                  data-testid="input-profile-instagram"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="advisorName">Advisor Name</Label>
                <Input
                  id="advisorName"
                  value={profileData.advisorName}
                  onChange={(e) => setProfileData({ ...profileData, advisorName: e.target.value })}
                  placeholder="Dr. Sarah Martinez"
                  data-testid="input-profile-advisor-name"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="advisorEmail">Advisor Email</Label>
                <Input
                  id="advisorEmail"
                  type="email"
                  value={profileData.advisorEmail}
                  onChange={(e) => setProfileData({ ...profileData, advisorEmail: e.target.value })}
                  placeholder="sarah.martinez@university.edu"
                  data-testid="input-profile-advisor-email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Profile Photo</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-24 w-24" style={{ backgroundColor: profileData.avatarColor }}>
                  {profileData.profileImageUrl ? (
                    <AvatarImage src={profileData.profileImageUrl} alt={profileData.name} />
                  ) : (
                    <AvatarFallback
                      style={{ backgroundColor: profileData.avatarColor, color: "white" }}
                      className="text-2xl font-medium"
                    >
                      {profileData.name
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
                    data-testid="button-upload-profile-image"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingImage ? "Uploading..." : "Upload Photo"}
                  </Button>
                  {profileData.profileImageUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setProfileData({ ...profileData, profileImageUrl: null })}
                      data-testid="button-remove-profile-image"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove Photo
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
                    onClick={() => setProfileData({ ...profileData, avatarColor: color })}
                    className={`h-10 w-10 rounded-full border-2 transition-all ${
                      profileData.avatarColor === color ? "border-foreground scale-110" : "border-border"
                    }`}
                    style={{ backgroundColor: color }}
                    data-testid={`button-color-${color.replace("#", "")}`}
                  />
                ))}
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={updateProfileMutation.isPending || uploadingImage} 
              data-testid="button-save-profile"
            >
              {updateProfileMutation.isPending ? "Saving..." : uploadingImage ? "Uploading image..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
