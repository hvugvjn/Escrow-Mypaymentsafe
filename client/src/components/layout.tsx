import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { LayoutDashboard, PlusCircle, User, LogOut, Menu, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PaxLogo } from "@/components/pax-logo";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    ...(user?.role === "BUYER"
      ? [{ title: "New Project", url: "/projects/new", icon: PlusCircle }]
      : []),
    { title: "Profile", url: "/profile", icon: User },
  ];

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">

      {/* ═══════════════════════════════════════════
          MOBILE TOP HEADER (visible on < md)
      ═══════════════════════════════════════════ */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border/50 bg-background sticky top-0 z-40">
        <PaxLogo className="text-2xl" />
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 border border-border">
            <AvatarImage src={user?.profileImageUrl || undefined} />
            <AvatarFallback className="text-xs">{user?.firstName?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* ═══════════════════════════════════════════
          MOBILE SLIDE-DOWN MENU (when hamburger is open)
      ═══════════════════════════════════════════ */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-[57px] left-0 right-0 z-50 bg-background border-b border-border/50 shadow-xl">
          <div className="p-4 space-y-1">
            {/* User info */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border/50 mb-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.profileImageUrl || undefined} />
                <AvatarFallback>{user?.firstName?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            {navItems.map((item) => {
              const isActive = location === item.url;
              return (
                <Link key={item.url} href={item.url} onClick={() => setMobileMenuOpen(false)}>
                  <div className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    isActive ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-foreground"
                  )}>
                    <item.icon className="w-5 h-5" />
                    {item.title}
                  </div>
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Log out
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          DESKTOP / TABLET SIDEBAR (hidden on mobile)
      ═══════════════════════════════════════════ */}
      <aside className="hidden md:flex flex-col w-20 lg:w-64 min-h-screen border-r border-border/50 bg-sidebar sticky top-0 h-screen shrink-0">
        {/* Logo */}
        <div className="p-4 lg:p-6 pb-2 flex items-center justify-center lg:justify-start border-b border-border/30">
          <PaxLogo className="text-2xl" />
        </div>

        {/* User info — full on lg, avatar only on md */}
        <div className="px-3 lg:px-4 py-4">
          <div className="flex items-center gap-3 bg-secondary/50 p-3 rounded-xl border border-border/50">
            <Avatar className="h-9 w-9 shrink-0 border border-background">
              <AvatarImage src={user?.profileImageUrl || undefined} />
              <AvatarFallback>{user?.firstName?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div className="hidden lg:flex flex-col min-w-0">
              <span className="text-sm font-semibold truncate">{user?.firstName} {user?.lastName}</span>
              <span className="text-xs text-muted-foreground truncate">{user?.role || "Guest"}</span>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 lg:px-4 space-y-1 mt-2">
          <p className="hidden lg:block text-xs text-muted-foreground font-semibold uppercase tracking-widest px-2 mb-2">Menu</p>
          {navItems.map((item) => {
            const isActive = location === item.url;
            return (
              <Link key={item.url} href={item.url}>
                <div title={item.title} className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 justify-center lg:justify-start",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}>
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span className="hidden lg:block">{item.title}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Logout at bottom */}
        <div className="p-2 lg:p-4 mt-auto border-t border-border/30">
          <button
            title="Log out"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors justify-center lg:justify-start"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="hidden lg:block">Log out</span>
          </button>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════════════ */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-10">
          {children}
        </div>
      </main>

      {/* ═══════════════════════════════════════════
          MOBILE BOTTOM NAV BAR (visible on < md)
          Shows ALL options always — no hiding
      ═══════════════════════════════════════════ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border/50 safe-area-pb">
        <div className="flex items-stretch">
          {navItems.map((item) => {
            const isActive = location === item.url;
            return (
              <Link key={item.url} href={item.url} className="flex-1">
                <div className={cn(
                  "flex flex-col items-center justify-center py-2 px-1 gap-1 text-xs font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}>
                  <item.icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
                  <span className="truncate">{item.title}</span>
                </div>
              </Link>
            );
          })}
          {/* Logout always in bottom nav */}
          <button onClick={handleLogout} className="flex-1">
            <div className="flex flex-col items-center justify-center py-2 px-1 gap-1 text-xs font-medium text-muted-foreground hover:text-destructive transition-colors">
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </div>
          </button>
        </div>
      </nav>

    </div>
  );
}
