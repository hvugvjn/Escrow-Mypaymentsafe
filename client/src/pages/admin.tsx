import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Users, FolderOpen, ShieldCheck, TrendingUp, MessageSquare,
  DollarSign, Activity, AlertTriangle, CheckCircle2, Clock,
  BarChart3, Layers, ArrowUpRight, Globe, BadgeCheck, Loader2, LogOut
} from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useEffect } from "react";

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
  buyers: number;
  freelancers: number;
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
  buyerName: string;
  freelancerName: string;
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
        <CardContent className="p-5 flex items-start gap-4 relative">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
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

  if (!adminCheck?.isAdmin) return null;

  const isLoading = statsLoading || usersLoading || projectsLoading;

  return (
    <div className="min-h-screen bg-background">
      {/* ── Top Header Bar ─────────────────────────────────────── */}
      <div className="border-b bg-card/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Admin Control Panel</h1>
              <p className="text-xs text-muted-foreground">Paxdot Platform — Full Visibility</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-muted-foreground font-medium">Live</span>
            </div>
            <a href="/api/logout" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted text-sm font-medium transition-colors">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">

        {/* ── Stat Cards ─────────────────────────────────────────────────── */}
        {stats && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Platform Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={Users} label="Total Users" value={stats.totalUsers} sub={`${stats.buyers} buyers · ${stats.freelancers} freelancers`} color="bg-violet-500" />
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

        {/* ── All Projects Table ─────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">All Projects ({projects.length})</h2>
          </div>
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Project</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Code</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Status</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Buyer</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Freelancer</th>
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
                      <td className="p-4 text-sm max-w-[120px] truncate">{project.buyerName}</td>
                      <td className="p-4 text-sm max-w-[120px] truncate">{project.freelancerName}</td>
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
                  {projects.length === 0 && (
                    <tr><td colSpan={8} className="p-10 text-center text-muted-foreground">No projects yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        {/* ── All Users Table ────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">All Users ({users.length})</h2>
          </div>
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Name</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Email</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Role</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Company</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Country</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Profile</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Joined</th>
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
                            {u.role}
                          </span>
                        ) : <span className="text-xs text-muted-foreground">—</span>}
                      </td>
                      <td className="p-4 text-sm">{u.companyName || "—"}</td>
                      <td className="p-4 text-sm">{u.country || "—"}</td>
                      <td className="p-4">
                        {u.profileCompleted
                          ? <span className="flex items-center gap-1 text-xs text-emerald-600"><BadgeCheck className="w-3.5 h-3.5" />Complete</span>
                          : <span className="text-xs text-amber-600">Incomplete</span>
                        }
                      </td>
                      <td className="p-4 text-xs text-muted-foreground whitespace-nowrap">
                        {u.createdAt ? format(new Date(u.createdAt), "MMM d, yyyy") : "—"}
                      </td>
                    </motion.tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">No users yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
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
                      <span className="text-muted-foreground">Buyer: <span className="font-medium text-foreground">{project.buyerName}</span></span>
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

        <div className="pb-8 text-center text-xs text-muted-foreground">
          Auto-refreshes every 30 seconds · Admin view only · Paxdot Platform
        </div>
      </div>
    </div>
  );
}
