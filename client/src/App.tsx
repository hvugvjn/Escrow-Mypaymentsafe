import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import ProfileComplete from "@/pages/profile-complete";
import Dashboard from "@/pages/dashboard";
import CreateProject from "@/pages/create-project";
import ProjectDetails from "@/pages/project-details";
import Profile from "@/pages/profile";
import TalentSearch from "@/pages/talent-search";
import Inbox from "@/pages/inbox";
import AdminDashboard from "@/pages/admin";
import { Privacy, Terms, Support, EscrowTerms, DynamicLegalPage } from "@/pages/legal";
import InfoPage from "@/pages/info";
import { AppLayout } from "@/components/layout";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const ADMIN_EMAIL = "info@paxdot.com";

// Wrapper for protected routes to handle redirects and layout
function ProtectedRoute({ component: Component, hideLayout = false }: { component: React.ComponentType, hideLayout?: boolean }) {
  const { user, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
    } else if (isAuthenticated && user?.email === ADMIN_EMAIL && location !== "/admin") {
      setLocation("/admin");
    } else if (isAuthenticated && !user?.role && location !== "/profile/complete" && user?.email !== ADMIN_EMAIL) {
      setLocation("/profile/complete");
    } else if (isAuthenticated && user?.role && location === "/" && user?.email !== ADMIN_EMAIL) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, user, location, setLocation]);

  if (!isAuthenticated) return null;
  if (!user?.role && location !== "/profile/complete" && user?.email !== ADMIN_EMAIL) return null;

  return hideLayout ? <Component /> : <AppLayout><Component /></AppLayout>;
}

// Admin-specific route — no AppLayout wrapper, own full-page layout
function AdminRoute() {
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) setLocation("/login");
    else if (user && user.email !== ADMIN_EMAIL) setLocation("/dashboard");
  }, [isAuthenticated, user]);

  if (!isAuthenticated || !user || user.email !== ADMIN_EMAIL) return null;
  return <AdminDashboard />;
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="h-screen w-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <Switch>
      {/* Public home/marketing page */}
      <Route path="/" component={() => isAuthenticated ? <ProtectedRoute component={Dashboard} /> : <Home />} />
      {/* Auth page */}
      <Route path="/login" component={() => isAuthenticated ? <ProtectedRoute component={Dashboard} /> : <Landing />} />
      <Route path="/profile/complete" component={() => <ProtectedRoute component={ProfileComplete} hideLayout />} />
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/projects/new" component={() => <ProtectedRoute component={CreateProject} />} />
      <Route path="/projects/:id" component={() => <ProtectedRoute component={ProjectDetails} />} />
      <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />
      <Route path="/talent" component={() => <ProtectedRoute component={TalentSearch} />} />
      <Route path="/inbox" component={() => <ProtectedRoute component={Inbox} />} />
      <Route path="/inbox/:chatId" component={() => <ProtectedRoute component={Inbox} />} />

      {/* Admin panel */}
      <Route path="/admin" component={AdminRoute} />

      {/* Legal & Support */}
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/escrow-terms" component={EscrowTerms} />
      <Route path="/support" component={Support} />
      <Route path="/legal/:slug" component={DynamicLegalPage} />

      {/* Fallback */}
      <Route path="/info/:slug" component={InfoPage} />
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

