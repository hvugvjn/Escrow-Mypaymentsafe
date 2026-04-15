import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { LayoutDashboard, PlusCircle, User, LogOut, Menu, X, Search, Inbox } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PaxLogo } from "@/components/pax-logo";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

// ── Startup Sound Logic ────────────────────────────────────────────────────
const playPremiumChime = () => {
  try {
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const context = new AudioContextClass();
    const masterGain = context.createGain();
    masterGain.connect(context.destination);
    masterGain.gain.setValueAtTime(0, context.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.08, context.currentTime + 0.05);
    masterGain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 1.2);

    // High crystalline note
    const osc1 = context.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1244.51, context.currentTime); // Eb6
    osc1.connect(masterGain);

    // Deep resonance note
    const osc2 = context.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(311.13, context.currentTime); // Eb4
    osc2.connect(masterGain);

    osc1.start();
    osc2.start();
    osc1.stop(context.currentTime + 1.5);
    osc2.stop(context.currentTime + 1.5);
  } catch (e) {
    console.error("Audio chime failed", e);
  }
};
// ────────────────────────────────────────────────────────────────────────────

export function AppLayout({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);

  // Trigger sound exactly once when the layout mounts
  useEffect(() => {
    const hasPlayed = sessionStorage.getItem('pax_chime_played');
    if (!hasPlayed) {
      setTimeout(playPremiumChime, 400); // Small delay to sync with splash fade
      sessionStorage.setItem('pax_chime_played', 'true');
    }
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only allow pull to refresh if we are at the very top of the scroll
    const scrollContainer = document.querySelector('main');
    if (scrollContainer && scrollContainer.scrollTop === 0) {
      setStartY(e.touches[0].pageY);
    } else {
      setStartY(0);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === 0 || isRefreshing) return;
    
    const y = e.touches[0].pageY;
    const diff = y - startY;
    
    if (diff > 0 && diff < 150) {
      setPullDistance(diff);
      // Prevent browser default scroll behaviors
      if (diff > 10) {
         if (e.cancelable) e.preventDefault();
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > 80) {
      setIsRefreshing(true);
      setPullDistance(40); // Snap to loading position
      
      try {
        // Refetch all active queries to "Refresh" the data
        await queryClient.refetchQueries();
        // Give a small delay for feel
        await new Promise(r => setTimeout(r, 600));
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
    setStartY(0);
  };
  const { user } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Messages", url: "/inbox", icon: Inbox },
    ...(user?.role === "BUYER"
      ? [
          { title: "Find Talent", url: "/talent", icon: Search },
          { title: "New Project", url: "/projects/new", icon: PlusCircle }
        ]
      : []),
    { title: "Profile", url: "/profile", icon: User },
  ];

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      window.location.href = "/api/logout";
    }
  };

  return (
    <div className="h-[100dvh] bg-background flex flex-col md:flex-row overflow-hidden w-full">

      {/* ═══════════════════════════════════════════
          MOBILE TOP HEADER (visible on < md)
      ═══════════════════════════════════════════ */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border/50 bg-background sticky top-0 z-40 w-full">
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
                    isActive ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-secondary text-foreground"
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
              <span className="text-xs text-muted-foreground truncate">
                {user?.role === "BUYER" ? "Client" : user?.role === "FREELANCER" ? "Talent" : user?.role || "Guest"}
              </span>
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
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 justify-center lg:justify-start",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 font-semibold"
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
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors justify-center lg:justify-start"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="hidden lg:block">Log out</span>
          </button>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════
          MAIN CONTENT with Pull-to-Refresh
      ═══════════════════════════════════════════ */}
      <main 
        className="flex-1 overflow-y-auto overflow-x-hidden pb-20 md:pb-0 min-w-0 w-full relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Pull to Refresh Indicator */}
        <AnimatePresence>
          {(pullDistance > 0 || isRefreshing) && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5, y: -20 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: Math.min(pullDistance - 40, 40)
              }}
              exit={{ opacity: 0, scale: 0.5, y: -20 }}
              className="absolute left-0 right-0 flex justify-center z-50 pointer-events-none"
            >
              <div className="bg-white dark:bg-zinc-900 rounded-full shadow-lg p-2 border border-border">
                {isRefreshing ? (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                ) : (
                  <motion.div 
                    style={{ rotate: (pullDistance / 80) * 180 }}
                    className="text-primary"
                  >
                    <PlusCircle className="w-5 h-5" />
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-6 lg:p-10 w-full">
          {children}
        </div>
      </main>

      {/* ═══════════════════════════════════════════
          MOBILE BOTTOM NAV BAR (visible on < md)
          Redesigned for a premium, spacious app-like feel
      ═══════════════════════════════════════════ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-t border-border/40 shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.1)]" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = location === item.url;
            return (
              <Link key={item.url} href={item.url} className="flex-1 max-w-[70px]">
                <div className={cn(
                  "flex flex-col items-center justify-center gap-1.5 py-1 px-1 transition-all duration-300 relative",
                  isActive ? "text-primary scale-105" : "text-muted-foreground/70 hover:text-foreground"
                )}>
                  <div className={cn(
                    "p-1.5 rounded-xl transition-colors",
                    isActive ? "bg-primary/10" : "bg-transparent"
                  )}>
                    <item.icon className={cn("w-5 h-5", isActive ? "stroke-[2.5]" : "stroke-[1.8]")} />
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold tracking-tight uppercase leading-none truncate w-full text-center",
                    isActive ? "opacity-100" : "opacity-70"
                  )}>
                    {item.title.split(' ')[0]}
                  </span>
                  {isActive && (
                    <motion.div 
                      layoutId="activeTabDot"
                      className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </div>
              </Link>
            );
          })}
          
          {/* Logout Button */}
          <button 
            onClick={handleLogout} 
            className="flex-1 max-w-[70px] flex flex-col items-center justify-center gap-1.5 py-1 px-1 text-muted-foreground/70 hover:text-destructive transition-all"
          >
            <div className="p-1.5 rounded-xl">
              <LogOut className="w-5 h-5 stroke-[1.8]" />
            </div>
            <span className="text-[10px] font-bold tracking-tight uppercase leading-none">Logout</span>
          </button>
        </div>
      </nav>

    </div>
  );
}
