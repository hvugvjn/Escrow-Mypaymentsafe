import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BarChart3, Layers, ArrowUpRight, Globe, BadgeCheck, Loader2, LogOut,
  Target, Zap, Mail, Share, Download, Image as ImageIcon, Briefcase, MapPin, Search, Filter, Plus, FileJson,
  Users, FolderOpen, ShieldCheck, TrendingUp, MessageSquare, DollarSign, Activity, AlertTriangle, CheckCircle2, Clock
} from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────
interface AdminStats {
  totalUsers: number;
  totalProjects: number;
  totalMilestones: number;
  totalMessages: number;
  totalEscrowValue: number;
  totalReleased: number;
  fundedEscrows: number;
  statusCounts: Record<string, number>;
  clients: number;
  talents: number;
}

interface AdminUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string | null;
  profileCompleted: boolean | null;
  companyName: string | null;
  country: string | null;
  createdAt: string | null;
}

interface AdminProject {
  id: string;
  title: string;
  description: string;
  projectCode: string;
  status: string;
  currency: string;
  clientName: string;
  talentName: string;
  createdAt: string | null;
  escrow: {
    totalAmount: number;
    funded: boolean;
    releasedAmount: number;
    remainingAmount: number;
  } | null;
  milestones: { id: string; title: string; status: string; amount: number }[];
}

// ── Helpers ────────────────────────────────────────────────────────────────
const fmt = (cents: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 0 }).format(cents / 100);

const STATUS_COLOR: Record<string, string> = {
  WAITING_FOR_ACCEPTANCE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  WAITING_FOR_FUNDING: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  UNDER_REVIEW: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  DISPUTED: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  COMPLETED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  CANCELLED: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  PENDING: "bg-slate-100 text-slate-700",
  SUBMITTED: "bg-purple-100 text-purple-800",
  RELEASED: "bg-emerald-100 text-emerald-800",
  REVISION_REQUESTED: "bg-amber-100 text-amber-800",
};

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
        <div className={`absolute inset-0 opacity-5 ${color}`} />
        <CardContent className="p-4 md:p-5 flex items-start gap-3 md:gap-4 relative">
          <div className={`w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
            <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wider truncate">{label}</p>
            <p className="text-lg md:text-2xl font-bold text-foreground leading-tight">{value}</p>
            {sub && <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 truncate">{sub}</p>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Main Admin Dashboard ───────────────────────────────────────────────────
export default function AdminDashboard() {
  const [, setLocation] = useLocation();

  // Guard: check admin access
  const { data: adminCheck, isLoading: checkLoading } = useQuery<{ isAdmin: boolean }>({
    queryKey: ["/api/admin/me"],
    queryFn: async () => {
      const res = await fetch("/api/admin/me", { credentials: "include" });
      return res.json();
    },
  });

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats", { credentials: "include" });
      if (!res.ok) throw new Error("Forbidden");
      return res.json();
    },
    enabled: adminCheck?.isAdmin === true,
    refetchInterval: 30000,
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      return res.json();
    },
    enabled: adminCheck?.isAdmin === true,
    refetchInterval: 30000,
  });

  const { data: projects = [], isLoading: projectsLoading } = useQuery<AdminProject[]>({
    queryKey: ["/api/admin/projects"],
    queryFn: async () => {
      const res = await fetch("/api/admin/projects", { credentials: "include" });
      return res.json();
    },
    enabled: adminCheck?.isAdmin === true,
    refetchInterval: 30000,
  });

  const { data: leads = [], isLoading: leadsLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/leads"],
    queryFn: async () => {
      const res = await fetch("/api/admin/leads", { credentials: "include" });
      return res.json();
    },
    enabled: adminCheck?.isAdmin === true,
  });

  const [activeTab, setActiveTab] = useState("overview");
  const [outreachLoading, setOutreachLoading] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [aiPreviewLead, setAiPreviewLead] = useState<any | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [previewContent, setPreviewContent] = useState<{subject:string; body:string} | null>(null);

  const toggleLead = (id: string) => {
    setSelectedLeads(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAllLeads = () => {
    if (selectedLeads.length === leads.length) setSelectedLeads([]);
    else setSelectedLeads(leads.map(l => l.id));
  };

  const handleExport = async (format: 'csv' | 'json') => {
    const res = await fetch("/api/admin/leads/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadIds: selectedLeads, format }),
    });
    if (format === 'csv') {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pax_leads_${new Date().getTime()}.csv`;
      a.click();
    } else {
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pax_leads_${new Date().getTime()}.json`;
      a.click();
    }
  };

  const loadAiPreview = async (lead: any) => {
    setAiPreviewLead(lead);
    setIsAiLoading(true);
    setPreviewContent(null);
    try {
      const res = await fetch(`/api/admin/marketing/preview/${lead.id}`);
      const data = await res.json();
      setPreviewContent(data);
    } catch (err) {
      console.error("AI Preview error:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    if (!checkLoading && adminCheck && !adminCheck.isAdmin) {
      setLocation("/dashboard");
    }
  }, [adminCheck, checkLoading]);

  if (checkLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!adminCheck?.isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Access Denied</h1>
        <p className="text-slate-500 mt-2 max-w-xs">You do not have administrative privileges. Please log in with an authorized account.</p>
        <Button className="mt-6" onClick={() => setLocation("/dashboard")}>Return to Dashboard</Button>
      </div>
    );
  }

  const isLoading = statsLoading || usersLoading || projectsLoading;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* ── Top Header Bar ─────────────────────────────────────── */}
      <div className="border-b bg-card/80 backdrop-blur sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base md:text-lg font-bold tracking-tight truncate leading-none">Admin Control Panel</h1>
                <p className="text-[10px] md:text-xs text-muted-foreground truncate mt-1">Pax Platform — Full Visibility</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-muted-foreground font-medium">Live</span>
              </div>
              <button 
                onClick={() => { if(window.confirm("Are you sure you want to logout?")) window.location.href = "/api/logout"; }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted text-[10px] md:text-sm font-medium transition-colors border md:border-0"
              >
                <LogOut className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden xs:inline">Logout</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar -mx-2 px-2 scroll-smooth">
            {[
              { id: "overview", label: "Overview", icon: Activity },
              { id: "projects", label: "Projects", icon: FolderOpen },
              { id: "users", label: "Users", icon: Users },
              { id: "growth", label: "Growth", icon: Zap, color: "bg-violet-500 hover:bg-violet-600 text-white" }
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "rounded-full px-4 h-8 text-[11px] md:text-xs font-semibold shrink-0 transition-all",
                  tab.color,
                  activeTab === tab.id && !tab.color && "bg-primary text-primary-foreground shadow-md"
                )}
              >
                {tab.icon && <tab.icon className="w-3.5 h-3.5 mr-1.5" />}
                {tab.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "overview" && (
          <div className="space-y-10 animate-in fade-in duration-500">

        {/* ── Stat Cards ─────────────────────────────────────────────────── */}
        {stats && (
          <section>
            <h2 className="text-[10px] md:text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Platform Overview</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <StatCard icon={Users} label="Total Users" value={stats.totalUsers} sub={`${stats.buyers} clients · ${stats.freelancers} talents`} color="bg-violet-500" />
              <StatCard icon={FolderOpen} label="All Projects" value={stats.totalProjects} sub={`${stats.statusCounts["ACTIVE"] || 0} active`} color="bg-blue-500" />
              <StatCard icon={DollarSign} label="Total Escrow Value" value={fmt(stats.totalEscrowValue)} sub={`${stats.fundedEscrows} funded`} color="bg-emerald-500" />
              <StatCard icon={TrendingUp} label="Total Released" value={fmt(stats.totalReleased)} sub="across all projects" color="bg-orange-500" />
              <StatCard icon={Layers} label="Milestones" value={stats.totalMilestones} color="bg-sky-500" />
              <StatCard icon={MessageSquare} label="Messages" value={stats.totalMessages} color="bg-pink-500" />
              <StatCard icon={CheckCircle2} label="Completed" value={stats.statusCounts["COMPLETED"] || 0} sub="projects done" color="bg-green-600" />
              <StatCard icon={AlertTriangle} label="Disputes" value={stats.statusCounts["DISPUTED"] || 0} sub="need attention" color="bg-red-500" />
            </div>
          </section>
        )}

        {/* ── Project Status Breakdown ────────────────────────────────────── */}
        {stats && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Project Status Breakdown</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {Object.entries(stats.statusCounts).map(([status, cnt]) => (
                <Card key={status} className="border-0 shadow-sm">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">{cnt}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${STATUS_COLOR[status] || "bg-gray-100 text-gray-600"}`}>
                      {status.replace(/_/g, " ")}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
          </div>
        )}

        {(activeTab === "overview" || activeTab === "projects") && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {/* ── All Projects Table ─────────────────────────────────────────── */}
             <section>
               <div className="flex items-center justify-between mb-4">
                 <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">All Projects ({projects.length})</h2>
               </div>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/40">
                        <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Project</th>
                        <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Code</th>
                        <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Status</th>
                        <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Client</th>
                        <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Talent</th>
                        <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Escrow</th>
                        <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Milestones</th>
                        <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((project, i) => (
                        <motion.tr
                          key={project.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="border-b hover:bg-muted/30 transition-colors"
                        >
                          <td className="p-4">
                            <div className="font-semibold max-w-[180px] truncate">{project.title}</div>
                            <div className="text-xs text-muted-foreground max-w-[180px] truncate">{project.description}</div>
                          </td>
                          <td className="p-4">
                            <code className="bg-muted px-2 py-1 rounded font-mono text-xs font-bold">{project.projectCode}</code>
                          </td>
                          <td className="p-4">
                            <span className={`text-[10px] font-semibold px-2 py-1 rounded-full whitespace-nowrap ${STATUS_COLOR[project.status] || "bg-gray-100 text-gray-600"}`}>
                              {project.status.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="p-4 text-sm max-w-[120px] truncate">{project.clientName}</td>
                          <td className="p-4 text-sm max-w-[120px] truncate">{project.talentName}</td>
                          <td className="p-4">
                            {project.escrow ? (
                              <div>
                                <p className="font-semibold">{fmt(project.escrow.totalAmount, project.currency)}</p>
                                <p className="text-xs text-muted-foreground">
                                  {project.escrow.funded ? "✅ Funded" : "⏳ Pending"} · Released: {fmt(project.escrow.releasedAmount, project.currency)}
                                </p>
                              </div>
                            ) : <span className="text-muted-foreground text-xs">—</span>}
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              {project.milestones.map(m => (
                                <span key={m.id} className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${STATUS_COLOR[m.status] || "bg-gray-100"}`}>
                                  {m.status}
                                </span>
                              ))}
                              {project.milestones.length === 0 && <span className="text-xs text-muted-foreground">None</span>}
                            </div>
                          </td>
                          <td className="p-4 text-xs text-muted-foreground whitespace-nowrap">
                            {project.createdAt ? format(new Date(project.createdAt), "MMM d, yyyy") : "—"}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Project Cards */}
                <div className="md:hidden divide-y">
                  {projects.map((project, i) => (
                    <motion.div 
                      key={project.id} 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ delay: i * 0.05 }}
                      className="p-4 space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-sm leading-tight">{project.title}</p>
                          <code className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-1 rounded">{project.projectCode}</code>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[project.status]}`}>
                          {project.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                         <div>
                            <p className="text-muted-foreground uppercase text-[9px] font-bold tracking-wider">Client</p>
                            <p className="font-medium truncate">{project.clientName}</p>
                         </div>
                         <div>
                            <p className="text-muted-foreground uppercase text-[9px] font-bold tracking-wider">Talent</p>
                            <p className="font-medium truncate">{project.talentName}</p>
                         </div>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg flex justify-between items-center text-[11px]">
                         <span className="font-bold">{fmt(project.escrow?.totalAmount || 0, project.currency)}</span>
                         <span className="text-muted-foreground">{project.milestones.length} milestones</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {projects.length === 0 && (
                  <div className="p-10 text-center text-muted-foreground text-sm italic">No projects yet.</div>
                )}
             </section>
             
             {/* ── Escrow Summary per Project ──────────────────────────────────── */}
             <section>
               <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Escrow Summary</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                 {projects.filter(p => p.escrow).map((project, i) => (
                   <motion.div key={project.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}>
                     <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                       <CardHeader className="pb-2 pt-4 px-5">
                         <div className="flex items-start justify-between">
                           <div>
                             <CardTitle className="text-sm font-semibold truncate max-w-[180px]">{project.title}</CardTitle>
                             <p className="text-xs text-muted-foreground font-mono">{project.projectCode}</p>
                           </div>
                           <span className={`text-[9px] font-bold px-2 py-1 rounded-full ${STATUS_COLOR[project.status]}`}>
                             {project.status.replace(/_/g, " ")}
                           </span>
                         </div>
                       </CardHeader>
                       <CardContent className="px-5 pb-5 space-y-3">
                         <div className="grid grid-cols-3 gap-2 text-center">
                           <div className="bg-muted/50 rounded-lg p-2">
                             <p className="text-xs text-muted-foreground">Total</p>
                             <p className="font-bold text-sm">{fmt(project.escrow!.totalAmount, project.currency)}</p>
                           </div>
                           <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-2">
                             <p className="text-xs text-muted-foreground">Released</p>
                             <p className="font-bold text-sm text-emerald-600">{fmt(project.escrow!.releasedAmount, project.currency)}</p>
                           </div>
                           <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-2">
                             <p className="text-xs text-muted-foreground">Remaining</p>
                             <p className="font-bold text-sm text-orange-600">{fmt(project.escrow!.remainingAmount, project.currency)}</p>
                           </div>
                         </div>
                         {/* Progress bar */}
                         <div>
                           <div className="flex justify-between text-xs text-muted-foreground mb-1">
                             <span>Release progress</span>
                             <span>{project.escrow!.totalAmount > 0 ? Math.round((project.escrow!.releasedAmount / project.escrow!.totalAmount) * 100) : 0}%</span>
                           </div>
                           <div className="h-2 bg-muted rounded-full overflow-hidden">
                             <div
                               className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all"
                               style={{ width: `${project.escrow!.totalAmount > 0 ? (project.escrow!.releasedAmount / project.escrow!.totalAmount) * 100 : 0}%` }}
                             />
                           </div>
                         </div>
                         <div className="flex items-center justify-between text-xs">
                           <span className="text-muted-foreground">Client: <span className="font-medium text-foreground">{project.clientName}</span></span>
                           <span className={`font-semibold ${project.escrow!.funded ? "text-emerald-600" : "text-amber-600"}`}>
                             {project.escrow!.funded ? "✅ Funded" : "⏳ Unfunded"}
                           </span>
                         </div>
                       </CardContent>
                     </Card>
                   </motion.div>
                 ))}
                 {projects.filter(p => p.escrow).length === 0 && (
                   <div className="col-span-3 text-center py-8 text-muted-foreground text-sm">No funded escrows yet.</div>
                 )}
               </div>
             </section>
          </div>
        )}

        {activeTab === "overview" && (
          <div className="pb-8 mt-10 text-center text-xs text-muted-foreground border-t pt-8">
            Auto-refreshes every 30 seconds · Admin view only · Pax Platform
          </div>
        )}

    {activeTab === "users" && (
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* ── All Users Table ────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">All Users ({users.length})</h2>
          </div>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/40 font-bold">
                        <th className="text-left p-4">Name</th>
                        <th className="text-left p-4">Email</th>
                        <th className="text-left p-4">Role</th>
                        <th className="text-left p-4">Company</th>
                        <th className="text-left p-4">Country</th>
                        <th className="text-left p-4">Profile</th>
                        <th className="text-left p-4">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u, i) => (
                        <motion.tr
                          key={u.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.02 }}
                          className="border-b hover:bg-muted/30 transition-colors"
                        >
                          <td className="p-4 font-medium">
                            {[u.firstName, u.lastName].filter(Boolean).join(" ") || <span className="text-muted-foreground italic">No name</span>}
                          </td>
                          <td className="p-4 text-muted-foreground">{u.email}</td>
                          <td className="p-4">
                            {u.role ? (
                              <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${u.role === "BUYER" ? "bg-blue-100 text-blue-800" : u.role === "FREELANCER" ? "bg-purple-100 text-purple-800" : "bg-red-100 text-red-800"}`}>
                                {u.role === "BUYER" ? "CLIENT" : u.role === "FREELANCER" ? "TALENT" : u.role}
                              </span>
                            ) : <span className="text-xs text-muted-foreground">—</span>}
                          </td>
                          <td className="p-4 text-sm">{u.companyName || "—"}</td>
                          <td className="p-4 text-sm">{u.country || "—"}</td>
                          <td className="p-4">
                            {u.profileCompleted
                              ? <span className="flex items-center gap-1 text-xs text-emerald-600 font-bold"><BadgeCheck className="w-3.5 h-3.5" />Complete</span>
                              : <span className="text-xs text-amber-600 font-bold">Incomplete</span>
                            }
                          </td>
                          <td className="p-4 text-xs text-muted-foreground whitespace-nowrap">
                            {u.createdAt ? format(new Date(u.createdAt), "MMM d, yyyy") : "—"}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile User Cards */}
                <div className="md:hidden divide-y">
                   {users.map((u, i) => (
                      <motion.div 
                        key={u.id} 
                        initial={{ opacity: 0, scale: 0.98 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        transition={{ delay: i * 0.04 }}
                        className="p-4 space-y-2"
                      >
                         <div className="flex justify-between items-center">
                            <span className="font-bold text-sm leading-tight truncate mr-2">
                               {[u.firstName, u.lastName].filter(Boolean).join(" ") || u.email}
                            </span>
                            {u.role && (
                               <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${u.role === "BUYER" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                                  {u.role === "BUYER" ? "CLIENT" : "TALENT"}
                               </span>
                            )}
                         </div>
                         <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
                         <div className="flex justify-between items-center pt-1">
                            <span className="text-[9px] text-muted-foreground">{u.country || "No location"}</span>
                            {u.profileCompleted ? (
                               <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-600"><BadgeCheck className="w-3 h-3" /> VERIFIED</span>
                            ) : (
                               <span className="text-[9px] font-bold text-amber-600">INCOMPLETE</span>
                            )}
                         </div>
                      </motion.div>
                   ))}
                </div>

                {users.length === 0 && (
                   <div className="p-10 text-center text-muted-foreground text-sm italic">No users in the system.</div>
                )}
        </section>
      </div>
    )}
        {activeTab === "growth" && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* ── Growth Stats ─────────────────────────────────────────── */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Outreach Performance</h2>
                <div className="flex gap-2">
                   <Button size="sm" variant="outline" className="h-8 border-violet-200 text-violet-700 bg-violet-50/50">
                    <Download className="w-3.5 h-3.5 mr-2" /> Export Performance
                   </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={Target} label="Total Leads" value={leads.length} sub="External database" color="bg-violet-600" />
                <StatCard icon={Mail} label="Contacted" value={leads.filter(l => l.status === 'CONTACTED').length} sub="First touch sent" color="bg-indigo-600" />
                <StatCard icon={MessageSquare} label="Replies" value={leads.filter(l => l.status === 'REPLIED').length} sub="High intent" color="bg-pink-600" />
                <StatCard icon={TrendingUp} label="Conv. Rate" value={`${leads.length > 0 ? ((leads.filter(l => l.status === 'REPLIED').length / leads.length) * 100).toFixed(1) : 0}%`} sub="Lead to reply" color="bg-orange-600" />
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* ── Campaigns & Tools ────────────────────────────────────── */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="border-0 shadow-sm bg-gradient-to-br from-violet-600 to-indigo-700 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Zap className="w-5 h-5 fill-white" />
                      Quick Campaigns
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      className="w-full justify-start bg-white/10 hover:bg-white/20 border-white/20 text-white" 
                      onClick={() => setOutreachLoading(true)}
                      disabled={outreachLoading}
                    >
                      {outreachLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                      Start Outreach ({leads.filter(l => l.location?.includes('London')).length})
                    </Button>
                    <Button className="w-full justify-start bg-white/10 hover:bg-white/20 border-white/20 text-white">
                      <Target className="w-4 h-4 mr-2" />
                      Global Talent Blast
                    </Button>
                    <p className="text-[10px] opacity-70 mt-2 italic px-1">
                      AI will personalize each message based on lead bio & location.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-sm">Import New Leads</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed border-muted rounded-xl p-8 text-center hover:border-violet-400 transition-colors cursor-pointer group">
                      <div className="w-10 h-10 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                        <Plus className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-semibold">Drop CSV here</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Accepts export.csv format</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm overflow-hidden">
                  <div className="aspect-square relative group cursor-pointer bg-slate-900">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                    <img src="https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" alt="Poster Template" />
                    <div className="absolute bottom-4 left-4 right-4 z-20">
                      <p className="text-white text-xs font-bold uppercase tracking-widest mb-1">Coming Soon</p>
                      <h4 className="text-white font-bold">Dynamic Instagram Poster Generator</h4>
                      <Button size="sm" className="mt-3 w-full bg-white text-black hover:bg-slate-100">
                        <ImageIcon className="w-3.5 h-3.5 mr-2" /> Configure Templates
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>

              {/* ── Leads Table ──────────────────────────────────────────── */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-0 shadow-sm overflow-hidden min-h-[600px]">
                  <CardHeader className="border-b bg-card flex flex-row items-center justify-between pb-4">
                    <div>
                      <CardTitle className="text-lg">Recent Leads</CardTitle>
                      <p className="text-xs text-muted-foreground">Manage external outreach targets</p>
                    </div>
                    <div className="flex gap-2">
                       {Array.isArray(leads) && selectedLeads.length > 0 && (
                         <div className="flex gap-2 animate-in fade-in zoom-in duration-200">
                            <Button size="sm" variant="outline" onClick={() => handleExport('csv')} className="text-xs h-9">
                              <Download className="w-3.5 h-3.5 mr-2" /> Export CSV ({selectedLeads.length})
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleExport('json')} className="text-xs h-9">
                              <FileJson className="w-3.5 h-3.5 mr-2" /> JSON ({selectedLeads.length})
                            </Button>
                         </div>
                       )}
                       <div className="relative">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <input className="h-9 w-[180px] rounded-md border border-input bg-background pl-8 pr-3 text-xs focus:ring-1 focus:ring-violet-400 outline-none" placeholder="Search leads..." />
                       </div>
                       <Button size="icon" variant="outline" className="h-9 w-9"><Filter className="w-4 h-4" /></Button>
                    </div>
                  </CardHeader>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/20">
                          <th className="p-4 text-center w-12">
                            <input 
                              type="checkbox" 
                              className="rounded border-muted text-violet-600 focus:ring-violet-400"
                              checked={leads.length > 0 && selectedLeads.length === leads.length}
                              onChange={selectAllLeads}
                            />
                          </th>
                          <th className="text-left p-4 font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">Lead</th>
                          <th className="text-left p-4 font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">Source</th>
                          <th className="text-left p-4 font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">Location</th>
                          <th className="text-left p-4 font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">Status</th>
                          <th className="text-left p-4 font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(leads) && leads.map((lead, i) => (
                           <motion.tr 
                              key={lead.id} 
                              initial={{ opacity: 0, x: -5 }} 
                              animate={{ opacity: 1, x: 0 }} 
                              transition={{ delay: i * 0.01 }}
                              className={`border-b hover:bg-muted/30 transition-colors ${selectedLeads.includes(lead.id) ? 'bg-violet-50/50' : ''}`}
                           >
                            <td className="p-4 text-center">
                              <input 
                                type="checkbox" 
                                className="rounded border-muted text-violet-600 focus:ring-violet-400"
                                checked={selectedLeads.includes(lead.id)}
                                onChange={() => toggleLead(lead.id)}
                              />
                            </td>
                            <td className="p-4">
                              <div className="font-semibold">{lead.firstName} {lead.lastName}</div>
                              <div className="text-xs text-muted-foreground font-mono">{lead.email}</div>
                            </td>
                            <td className="p-4 text-xs font-medium">
                              <Badge variant="outline" className="bg-slate-50">{lead.source}</Badge>
                            </td>
                            <td className="p-4 text-xs">
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3 h-3 text-violet-500" />
                                {lead.location || "Unknown"}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`text-[9px] font-bold px-2 py-1 rounded-full ${
                                lead.status === 'REPLIED' ? 'bg-emerald-100 text-emerald-700' :
                                lead.status === 'CONTACTED' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {lead.status}
                              </span>
                            </td>
                            <td className="p-4">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                title="AI Preview"
                                className="h-8 w-8 text-violet-600 hover:bg-violet-50"
                                onClick={() => loadAiPreview(lead)}
                              >
                                <Zap className="w-4 h-4" />
                              </Button>
                            </td>
                           </motion.tr>
                        ))}
                        {leads.length === 0 && (
                          <tr><td colSpan={5} className="p-20 text-center text-muted-foreground italic">No leads in the database. Import a CSV to get started.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* ── AI Preview Modal ────────────────────────────────────────────── */}
        {aiPreviewLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <Card className="w-full max-w-2xl shadow-2xl border-0">
               <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                  <div>
                    <CardTitle className="text-lg">AI Outreach Preview</CardTitle>
                    <p className="text-xs text-muted-foreground">Audit personlization for {aiPreviewLead.firstName}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setAiPreviewLead(null)} className="h-8 w-8">
                    <LogOut className="w-4 h-4 rotate-180" />
                  </Button>
               </CardHeader>
               <CardContent className="p-6">
                 {isAiLoading ? (
                   <div className="flex flex-col items-center justify-center py-20 space-y-4">
                      <Loader2 className="w-10 h-10 animate-spin text-violet-600" />
                      <p className="text-sm font-medium animate-pulse">Claude is thinking...</p>
                   </div>
                 ) : previewContent ? (
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Subject Line</label>
                          <div className="p-4 bg-muted/30 rounded-lg font-medium border text-sm flex justify-between items-center group">
                             {previewContent.subject}
                             <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => navigator.clipboard.writeText(previewContent.subject)}>
                               <Share className="w-3.5 h-3.5" />
                             </Button>
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email Body</label>
                          <div className="p-5 bg-muted/20 rounded-xl border leading-relaxed text-sm relative group">
                             {previewContent.body.split('\n').map((line, i) => <p key={i} className="mb-2">{line}</p>)}
                             <Button size="sm" variant="secondary" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => navigator.clipboard.writeText(previewContent.body)}>
                               <Share className="w-3.5 h-3.5 mr-2" /> Copy Full Message
                             </Button>
                          </div>
                       </div>
                       <div className="flex gap-3 pt-4 border-t">
                          <Button className="flex-1 bg-violet-600 hover:bg-violet-700">
                            <Mail className="w-4 h-4 mr-2" /> Approve & Send Now
                          </Button>
                          <Button variant="outline" className="flex-1" onClick={() => setAiPreviewLead(null)}>
                            Discard
                          </Button>
                       </div>
                    </div>
                 ) : (
                    <div className="text-center py-10 text-red-500 text-sm">Failed to generate preview. Check your ANTHROPIC_API_KEY.</div>
                 )}
               </CardContent>
            </Card>
          </div>
        )}

        {/* Tab checks removed as they are integrated above */}
      </div>
    </div>
  );
}
