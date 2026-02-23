import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import ProfileComplete from "@/pages/profile-complete";
import Dashboard from "@/pages/dashboard";
import CreateProject from "@/pages/create-project";
import ProjectDetails from "@/pages/project-details";
import Profile from "@/pages/profile";
import { AppLayout } from "@/components/layout";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

// Wrapper for protected routes to handle redirects and layout
function ProtectedRoute({ component: Component, hideLayout = false }: { component: React.ComponentType, hideLayout?: boolean }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        setLocation("/");
      } else if (isAuthenticated && !user?.role && location !== "/profile/complete") {
        setLocation("/profile/complete");
      } else if (isAuthenticated && user?.role && location === "/") {
        setLocation("/dashboard");
      }
    }
  }, [isLoading, isAuthenticated, user, location, setLocation]);

  if (isLoading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!isAuthenticated) return null;
  if (!user?.role && location !== "/profile/complete") return null;

  return hideLayout ? <Component /> : <AppLayout><Component /></AppLayout>;
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="h-screen w-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <Switch>
      <Route path="/" component={() => isAuthenticated ? <ProtectedRoute component={Dashboard} /> : <Landing />} />
      <Route path="/profile/complete" component={() => <ProtectedRoute component={ProfileComplete} hideLayout />} />
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/projects/new" component={() => <ProtectedRoute component={CreateProject} />} />
      <Route path="/projects/:id" component={() => <ProtectedRoute component={ProjectDetails} />} />
      <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
