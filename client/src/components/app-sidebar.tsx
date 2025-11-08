import {
  LayoutDashboard,
  ClipboardList,
  LayoutGrid,
  Upload,
  Users,
  Settings,
  Target,
  UserPlus,
  LogOut,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import logoImage from "@assets/30919374-809c-459f-a8a3-07e75b17bfe4_1762565937039.png";

const baseMenuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    testId: "link-dashboard",
  },
  {
    title: "Tasks",
    url: "/tasks",
    icon: ClipboardList,
    testId: "link-tasks",
  },
  {
    title: "Kanban",
    url: "/kanban",
    icon: LayoutGrid,
    testId: "link-kanban",
  },
  {
    title: "Role Timelines",
    url: "/timelines",
    icon: Target,
    testId: "link-timelines",
  },
  {
    title: "Documents",
    url: "/documents",
    icon: Upload,
    testId: "link-documents",
  },
  {
    title: "Team",
    url: "/team",
    icon: Users,
    testId: "link-team",
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user, isPresident } = useAuth();

  const presidentMenuItem = {
    title: "Team Setup",
    url: "/team-setup",
    icon: UserPlus,
    testId: "link-team-setup",
  };

  const menuItems = isPresident
    ? [...baseMenuItems, presidentMenuItem]
    : baseMenuItems;

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const getInitials = (firstName?: string | null, lastName?: string | null, email?: string | null) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <img 
            src={logoImage} 
            alt="TaskFlow Logo" 
            className="h-8 w-8 object-contain"
          />
          <div>
            <h2 className="text-base font-semibold text-sidebar-foreground">TaskFlow</h2>
            <p className="text-xs text-muted-foreground">Club Executive Manager</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={item.testId}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild data-testid="link-settings">
                  <Link href="/settings">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="space-y-3">
          {user && (
            <div className="flex items-center gap-3 px-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.profileImageUrl || undefined} />
                <AvatarFallback className="text-xs">
                  {getInitials(user.firstName, user.lastName, user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isPresident ? "President" : "Member"}
                </p>
              </div>
            </div>
          )}
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full"
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log Out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
