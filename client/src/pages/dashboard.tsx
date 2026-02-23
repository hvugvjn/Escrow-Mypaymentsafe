import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useProjects, useJoinProject } from "@/hooks/use-projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/status-badge";
import { PlusCircle, Search, ArrowRight, Wallet } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: projects = [], isLoading } = useProjects();
  const joinProject = useJoinProject();
  const [joinCode, setJoinCode] = useState("");

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    try {
      const res = await joinProject.mutateAsync(joinCode);
      setLocation(`/projects/${res.id}`);
    } catch (err) {
      // Error handled by hook toast
    }
  };

  if (isLoading) return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-6 py-1"><div className="h-2 rounded bg-slate-200"></div><div className="space-y-3"><div className="grid grid-cols-3 gap-4"><div className="h-2 col-span-2 rounded bg-slate-200"></div><div className="h-2 col-span-1 rounded bg-slate-200"></div></div><div className="h-2 rounded bg-slate-200"></div></div></div></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {user?.firstName}. Here's what's happening.</p>
        </div>
        
        {user?.role === 'BUYER' && (
          <Button asChild size="lg" className="hover-elevate bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Link href="/projects/new">
              <PlusCircle className="w-5 h-5 mr-2" />
              New Project
            </Link>
          </Button>
        )}
      </div>

      {user?.role === 'FREELANCER' && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <form onSubmit={handleJoin} className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Enter 6-character Project Code..." 
                  className="pl-10 h-12 text-lg bg-background"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                />
              </div>
              <Button type="submit" size="lg" className="h-12" disabled={joinProject.isPending || joinCode.length < 6}>
                Join Project
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-panel hover-elevate">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
              <h3 className="text-2xl font-bold">{projects.filter(p => p.status === 'ACTIVE').length}</h3>
            </div>
          </CardContent>
        </Card>
        {/* Additional stat cards could go here */}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold font-display">Your Projects</h2>
        
        {projects.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl bg-muted/20">
            <p className="text-muted-foreground">You don't have any projects yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer hover-elevate">
                  <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{project.title}</h3>
                        <StatusBadge status={project.status} />
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{project.description}</p>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-right">
                        <p className="text-muted-foreground">Code</p>
                        <p className="font-mono font-medium">{project.projectCode}</p>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="text-muted-foreground">Created</p>
                        <p className="font-medium">{project.createdAt ? format(new Date(project.createdAt), 'MMM d, yyyy') : 'Unknown'}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
