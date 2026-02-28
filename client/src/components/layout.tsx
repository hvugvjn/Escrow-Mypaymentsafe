import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { LayoutDashboard, PlusCircle, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PaxLogo } from "@/components/pax-logo";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [location] = useLocation();

  const navItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    ...(user?.role === 'BUYER' ? [{ title: "Create Project", url: "/projects/new", icon: PlusCircle }] : []),
    { title: "Profile", url: "/profile", icon: User },
  ];

  return (
    <SidebarProvider style={{ "--sidebar-width": "16rem" } as React.CSSProperties}>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <Sidebar className="border-r border-border/50 bg-sidebar">
          <SidebarContent>
            <div className="p-6 pb-2 flex items-center">
              <PaxLogo className="text-2xl" />
            </div>

            <div className="px-6 py-4">
              <div className="flex items-center gap-3 bg-secondary/50 p-3 rounded-xl border border-border/50">
                <Avatar className="h-10 w-10 border border-background">
                  <AvatarImage src={user?.profileImageUrl || undefined} />
                  <AvatarFallback>{user?.firstName?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold truncate">{user?.firstName} {user?.lastName}</span>
                  <span className="text-xs text-muted-foreground truncate">{user?.role || 'Guest'}</span>
                </div>
              </div>
            </div>

            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => {
                    const isActive = location === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={isActive} className="rounded-lg my-1">
                          <Link href={item.url} className="flex items-center gap-3 px-3 py-2">
                            <item.icon className="w-4 h-4" />
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <div className="mt-auto p-4">
              <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={() => window.location.href = '/api/logout'}>
                <LogOut className="w-4 h-4 mr-2" />
                Log out
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 overflow-y-auto">
          <div className="h-full w-full max-w-6xl mx-auto p-6 md:p-8 lg:p-10">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
