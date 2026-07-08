import { useState, useEffect, useRef } from "react";
import { useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useProject, useFundProject, useJoinProject } from "@/hooks/use-projects";
import { useSubmitMilestone, useApproveMilestone, useRequestRevision } from "@/hooks/use-milestones";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, FileCheck, AlertCircle, Calendar, DollarSign, CheckCircle2, FileText, CreditCard, Share2, Check, User, Users, Clock, AlertTriangle, Copy, ExternalLink, Flag, Send, MessageCircle, ShieldCheck } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { formatMoney as formatMoneyByCurrency } from "@/lib/currencies";
import { format, isPast } from "date-fns";
import { PaxLogo } from "@/components/pax-logo";
import { Anchor, Truck } from "lucide-react";

export default function ProjectDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data, isLoading } = useProject(id!);

  const fundProject = useFundProject();
  const submitMilestone = useSubmitMilestone();
  const approveMilestone = useApproveMilestone();
  const requestRevision = useRequestRevision();
  const joinProject = useJoinProject();
  const [joinCode, setJoinCode] = useState("");

  const [submitUrl, setSubmitUrl] = useState("");
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const prevMsgCount = useRef(0);
  const [receipt, setReceipt] = useState<{ type: string; amount: number; date?: string; milestoneTitle?: string } | null>(null);
  const [isCreatingPaymentLink, setIsCreatingPaymentLink] = useState<string | null>(null);
  const { toast } = useToast();

  const handleShare = () => {
    setIsShareOpen(true);
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setShareLinkCopied(true);
      setTimeout(() => setShareLinkCopied(false), 2000);
    }).catch(() => {
      toast({ title: "Link:", description: url });
    });
  };

  const handleWhatsAppShare = () => {
    const url = window.location.href;
    const text = `Join my project on PAX Escrow: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleEmailShare = () => {
    const url = window.location.href;
    const subject = encodeURIComponent('Join my project on PAX');
    const body = encodeURIComponent(`Hi,\n\nI'd like to invite you to view my project on PAX Escrow platform.\n\nClick this link to join:\n${url}\n\nRegards`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  // Fetch chat messages and poll every 5s
  useEffect(() => {
    if (!id) return;
    const fetchMsgs = async () => {
      try {
        const res = await fetch(`/api/projects/${id}/messages`, { credentials: 'include' });
        if (res.ok) setChatMessages(await res.json());
      } catch { }
    };
    fetchMsgs();
    const interval = setInterval(fetchMsgs, 5000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (chatMessages.length > prevMsgCount.current) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMsgCount.current = chatMessages.length;
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isSendingMsg) return;
    setIsSendingMsg(true);
    try {
      const res = await fetch(`/api/projects/${id}/messages`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: chatInput.trim() }),
      });
      if (res.ok) {
        const msg = await res.json();
        setChatMessages(prev => [...prev, msg]);
        setChatInput('');
      }
    } catch { }
    setIsSendingMsg(false);
  };

  // Pre-load selected milestone ID for uploads at top level
  useEffect(() => {
    const firstM = data?.milestones?.[0];
    if (firstM?.id && !selectedMilestoneId) {
      setSelectedMilestoneId(firstM.id);
    }
  }, [data?.milestones]);

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading project details...</div>;
  if (!data || !data.project) return <div className="p-8 text-center text-destructive">Project not found.</div>;

  const { project, milestones, escrow, clientName, talentName } = data;
  const isClient = user?.role === 'BUYER';
  const isTalent = user?.role === 'FREELANCER';

  const isParticipant = project.createdBy === user?.id || project.buyerId === user?.id || project.freelancerId === user?.id;

  const handleJoinInvited = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    try {
      await joinProject.mutateAsync(joinCode.trim().toUpperCase());
      toast({ title: "Joined!", description: "You have successfully joined the trade contract." });
      queryClient.invalidateQueries({ queryKey: ['/api/projects/:id', project.id] });
    } catch (err) { }
  };

  if (!isParticipant && project.status === 'WAITING_FOR_ACCEPTANCE') {
    return (
      <div className="max-w-md mx-auto py-12 px-4 animate-in fade-in duration-300">
        <Card className="border-blue-500/20 bg-[#0b1426]/40 border-white/10 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/25 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Anchor className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Join Trade Contract</CardTitle>
            <p className="text-xs text-white/50 mt-1">You have been invited to join this trade escrow workspace.</p>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="p-4 rounded-xl bg-slate-950/40 border border-white/5 space-y-2">
              <p className="text-xs text-white/40 uppercase font-semibold">Contract Title</p>
              <h3 className="text-sm font-bold text-white">{project.title}</h3>
              <p className="text-xs text-white/60 leading-relaxed mt-1">{project.description}</p>
              <p className="text-xs text-white/40 mt-2">
                Created by: <span className="font-semibold text-white/80">{clientName || 'Trade Partner'}</span>
              </p>
            </div>

            <form onSubmit={handleJoinInvited} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="joinCode" className="text-white text-xs uppercase font-semibold">Enter Join Code</Label>
                <Input
                  id="joinCode"
                  placeholder="6-CHARACTER CODE"
                  className="h-12 text-center text-lg tracking-widest font-mono bg-slate-950/50 border-white/10 text-white font-bold"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                />
              </div>
              <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold" disabled={joinProject.isPending || joinCode.length < 6}>
                {joinProject.isPending ? "Joining Workspace..." : "Accept & Join Contract"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatMoney = (cents: number): string => formatMoneyByCurrency(cents, project.currency || 'USD');

  const handleActivateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/activate`, {
        method: 'POST',
      });
      if (res.ok) {
        setIsPaymentOpen(false);
        toast({ title: 'Success', description: 'Project activated successfully.' });
        queryClient.invalidateQueries({ queryKey: ['/api/projects/:id', project.id] });
      } else {
        const data = await res.json();
        toast({ title: 'Error', description: data.message || 'Failed to activate project', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' });
    }
    setIsProcessingPayment(false);
  };

  const handleApproveWork = async (milestoneId: string) => {
    try {
      const res = await fetch(`/api/milestones/${milestoneId}/approve`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to approve work');
      queryClient.invalidateQueries({ queryKey: ['/api/projects/:id', project.id] });
      toast({ title: 'Success', description: 'Work approved. Funds are being released to the exporter!' });
    } catch (err) {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' });
    }
  };

  const handleSecureEscrow = async (milestoneId: string) => {
    setIsCreatingPaymentLink(milestoneId);
    try {
      const res = await fetch(`/api/milestones/${milestoneId}/payment-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id })
      });
      const data = await res.json();
      if (res.ok && data.paymentSessionId) {
        const cashfree = (window as any).Cashfree({
          mode: "production",
        });
        
        let checkoutOptions = {
          paymentSessionId: data.paymentSessionId,
          redirectTarget: "_self", 
        };
        
        try {
          cashfree.checkout(checkoutOptions);
        } catch (sdkErr) {
          console.error("SDK Error fallback:", sdkErr);
          if (data.paymentUrl) window.location.href = data.paymentUrl;
        }
      } else {
        if (data.message?.includes('authentication Failed')) {
          toast({ 
            title: 'Configuration Error', 
            description: 'The Cashfree API Keys provided to the server are invalid or expired. Please update CASHFREE_APP_ID and CASHFREE_SECRET_KEY.', 
            variant: 'destructive',
            duration: 10000
          });
        } else {
          toast({ title: 'Error', description: data.message || 'Failed to create payment link', variant: 'destructive' });
        }
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' });
    }
    setIsCreatingPaymentLink(null);
  };

  const handleSubmitWork = () => {
    if (selectedMilestoneId && submitUrl) {
      submitMilestone.mutate({ id: selectedMilestoneId, submissionUrl: submitUrl }, {
        onSuccess: () => {
          setIsSubmitOpen(false);
          setSubmitUrl("");
          queryClient.invalidateQueries({ queryKey: ['/api/projects/:id', project.id] });
        }
      });
    }
  };

  // Determine active logistics step (0 to 3)
  const m = milestones?.[0];
  let currentStep = 0;
  if (project.status === 'COMPLETED' || m?.status === 'RELEASED' || m?.status === 'APPROVED') {
    currentStep = 3;
  } else if (m?.submissionUrl) {
    currentStep = 2;
  } else if (project.status !== 'WAITING_FOR_FUNDING' && project.status !== 'PAYMENT_PENDING') {
    currentStep = 1;
  }



  return (
    <div className="space-y-4 md:space-y-6 max-w-6xl mx-auto pb-12 w-full animate-in fade-in duration-500 overflow-x-hidden">

      {/* Top Header Section */}
      <Card className="border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden bg-gradient-to-r from-blue-950/20 via-[#03091e]/85 to-slate-950/20 backdrop-blur-md">
        <div className="p-5 md:p-8 flex flex-col gap-4 bg-[#0b1426]/30 border-b border-white/[0.04]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-white">{project.title}</h1>
                <StatusBadge status={project.status} />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-white/40 font-medium text-xs uppercase tracking-wider">Trade Code:</p>
                <div className="flex items-center bg-black/60 border border-white/10 rounded-lg overflow-hidden shadow-inner">
                  <span className="font-mono px-3 py-1 font-bold text-blue-400 tracking-widest text-xs">{project.projectCode}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(project.projectCode);
                      toast({ title: "Copied!", description: "Trade code copied to clipboard." });
                    }}
                    className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-3 py-1 transition-all border-l border-white/10 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                    title="Copy Code"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" onClick={handleShare} className="gap-2 border-white/10 text-white bg-slate-950/40 hover:bg-slate-950/60 hover:border-white/20 transition-all font-semibold rounded-lg text-xs">
                <Share2 className="w-4 h-4 text-blue-400" /> Share Contract
              </Button>
            </div>
          </div>
        </div>

        {/* Metadata Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 md:p-8 bg-black/40 border-t border-white/[0.04]">
          <div className="space-y-1.5 p-4 rounded-xl bg-white/[0.02] border border-white/[0.03] shadow-inner">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Importer (Buyer)</p>
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <Users className="w-4 h-4 text-blue-400" /> {clientName}
            </div>
          </div>
          <div className="space-y-1.5 p-4 rounded-xl bg-white/[0.02] border border-white/[0.03] shadow-inner">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Exporter (Seller)</p>
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <User className="w-4 h-4 text-emerald-400" /> {talentName}
            </div>
          </div>
          <div className="space-y-1.5 p-4 rounded-xl bg-white/[0.02] border border-white/[0.03] shadow-inner">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Delivery Target</p>
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <Calendar className="w-4 h-4 text-indigo-400" />
              {project.expiresAt ? format(new Date(project.expiresAt), 'MMM d, yyyy') : 'TBD'}
            </div>
          </div>
          <div className="space-y-1.5 p-4 rounded-xl bg-white/[0.02] border border-white/[0.03] shadow-inner">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Trade Priority</p>
            <div className="flex items-center gap-2 font-bold text-amber-500 text-sm">
              <Clock className="w-4 h-4 text-amber-500 animate-pulse" /> High Priority
            </div>
          </div>
        </div>
      </Card>

      {/* Visual Cargo Tracker */}
      <Card className="border border-blue-500/10 shadow-[0_8px_30px_rgba(30,58,138,0.06)] p-5 md:p-8 bg-gradient-to-b from-[#0a1128]/70 to-[#04091a]/90 backdrop-blur-md">
        <h3 className="font-display font-semibold text-base md:text-lg mb-6 text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span> Cargo Logistics & Escrow Tracking
        </h3>
        <div className="overflow-x-auto -mx-1 px-1 pb-2">
          <div className="flex items-center justify-between relative min-w-[500px] max-w-4xl mx-auto pt-2 pb-4">
            {/* Connector Line */}
            <div className="absolute top-1/2 left-0 right-0 h-[3px] bg-white/5 -translate-y-[28px] z-0 rounded-full"></div>
            <div className="absolute top-1/2 left-0 h-[3px] bg-blue-500 -translate-y-[28px] z-0 rounded-full transition-all duration-1000" style={{ width: `${(currentStep / 3) * 100}%` }}></div>

            {[
              { label: "Contract Created", icon: FileText, num: 1 },
              { label: "Deposit Secured", icon: ShieldCheck, num: 2 },
              { label: "Cargo Dispatched", icon: Truck, num: 3 },
              { label: "Trade Settled", icon: CheckCircle2, num: 4 },
            ].map((step, idx) => {
              const isCompleted = idx < currentStep;
              const isCurrent = idx === currentStep;
              const StepIcon = step.icon;
              return (
                <div key={idx} className="relative z-10 flex flex-col items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-lg transition-all duration-300 ${
                    isCompleted ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-emerald-500/20 scale-105" :
                    isCurrent ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-blue-600/35 ring-4 ring-blue-500/15 scale-110" :
                    "bg-[#04091a] text-white/30 border border-white/10"
                  }`}>
                    {isCompleted ? <Check className="w-5 h-5 text-white" /> : <StepIcon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs md:text-sm font-semibold whitespace-nowrap tracking-wide transition-all ${
                    isCurrent ? "text-blue-400 font-bold" : 
                    isCompleted ? "text-emerald-400/80" : 
                    "text-white/40"
                  }`}>{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Unified Document Checklist & Vault */}
      {m && (
        <Card className="border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden bg-[#03091e]/85 backdrop-blur-md">
          <CardHeader className="border-b border-white/[0.05] bg-[#0b1426]/50 py-4 px-6">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-400" /> Required Cargo Documentation Checklist
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-white/80">
                <thead className="text-xs text-white/40 uppercase bg-slate-950/60">
                  <tr>
                    <th className="px-5 py-4 font-bold tracking-wider">Document Type</th>
                    <th className="px-5 py-4 font-bold tracking-wider">Required By</th>
                    <th className="px-5 py-4 font-bold tracking-wider">Status</th>
                    <th className="px-5 py-4 font-bold tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-5 font-semibold text-white/95">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">
                          CI
                        </div>
                        <span>Commercial Invoice & Packing List</span>
                      </div>
                    </td>
                    <td className="px-5 py-5 text-white/50 text-xs font-semibold">Exporter ({talentName})</td>
                    <td className="px-5 py-5">
                      {m.submissionUrl ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                          ✓ Uploaded
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                          ⏳ Awaiting Dispatch
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-5 text-right">
                      {m.submissionUrl ? (
                        <a href={m.submissionUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 hover:underline font-bold bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/15">
                          View File <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-white/20">—</span>
                      )}
                    </td>
                  </tr>

                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-5 font-semibold text-white/95">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs">
                          BL
                        </div>
                        <span>Bill of Lading (BoL) / Shipping Receipt</span>
                      </div>
                    </td>
                    <td className="px-5 py-5 text-white/50 text-xs font-semibold">Exporter ({talentName})</td>
                    <td className="px-5 py-5">
                      {m.submissionUrl ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                          ✓ Uploaded
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                          ⏳ Awaiting Dispatch
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-5 text-right">
                      {m.submissionUrl ? (
                        <a href={m.submissionUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 hover:underline font-bold bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/15">
                          View File <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-white/20">—</span>
                      )}
                    </td>
                  </tr>

                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-5 font-semibold text-white/95">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xs">
                          QC
                        </div>
                        <span>Quality Certificate (SGS Inspection)</span>
                      </div>
                    </td>
                    <td className="px-5 py-5 text-white/50 text-xs font-semibold">Exporter ({talentName})</td>
                    <td className="px-5 py-5">
                      {m.submissionUrl ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                          ✓ Certified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                          ⏳ Awaiting Dispatch
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-5 text-right">
                      {m.submissionUrl ? (
                        <a href={m.submissionUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 hover:underline font-bold bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/15">
                          View File <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-white/20">—</span>
                      )}
                    </td>
                  </tr>

                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-5 font-semibold text-white/95">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs">
                          BE
                        </div>
                        <span>Import customs declaration (Bill of Entry)</span>
                      </div>
                    </td>
                    <td className="px-5 py-5 text-white/50 text-xs font-semibold">Importer ({clientName})</td>
                    <td className="px-5 py-5">
                      {currentStep === 3 ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          ✓ Cleared
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                          ⏳ Awaiting Arrival
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-5 text-right font-medium">
                      {currentStep === 3 ? (
                        <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/15">Customs Cleared</span>
                      ) : (
                        <span className="text-white/20">—</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Document Warning or Overdue Info */}
            {m.status === 'PENDING' && isPast(new Date(m.deadline)) && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Late Cargo Documentation Alert</p>
                  <p className="text-xs mt-0.5 opacity-90">This trade contract has exceeded its delivery deadline. Please communicate with your partner via chat.</p>
                </div>
              </div>
            )}

            {/* Unified Bottom Action Panel */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#030816]/40 p-5 rounded-xl border border-white/5 mt-4">
              <div className="text-left w-full sm:w-auto">
                <p className="text-xs text-white/40 font-medium uppercase tracking-wider">Escrow Status</p>
                <h4 className="text-lg font-bold text-white mt-0.5">
                  {currentStep === 0 ? "Awaiting Deposit" : 
                   currentStep === 1 ? "Escrow Locked & Manufacturing" : 
                   currentStep === 2 ? "Cargo Dispatched (Under Verification)" : 
                   "Trade Settled & Released"}
                </h4>
                <p className="text-xs text-white/50 mt-1">
                  Value locked: <span className="font-semibold text-white">{formatMoney(m.amount)}</span>
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {/* 1. Importer Locks Escrow Funds */}
                {isClient && currentStep === 0 && (
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg gap-2 w-full sm:w-auto" onClick={() => handleSecureEscrow(m.id)} disabled={isCreatingPaymentLink === m.id}>
                    <Lock className="w-4 h-4" /> {isCreatingPaymentLink === m.id ? 'Loading...' : `Lock Trade Funds (${formatMoney(m.amount)})`}
                  </Button>
                )}

                {/* 2. Exporter Uploads Cargo Documentation */}
                {isTalent && currentStep === 1 && (
                  <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg gap-2 w-full sm:w-auto">
                        <Send className="w-4 h-4" /> Upload Cargo Documents
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#0b1426] border-white/10 text-white">
                      <DialogHeader>
                        <DialogTitle className="text-white">Upload Cargo Shipping Documents</DialogTitle>
                        <DialogDescription className="text-white/60">
                          Provide the access link to your Commercial Invoice, packing specifications, and carrier Bill of Lading.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="docUrl" className="text-white">Shipping Document URL (Google Drive, Dropbox, MSC/Maersk Tracking link)</Label>
                          <Input id="docUrl" value={submitUrl} onChange={e => setSubmitUrl(e.target.value)} placeholder="https://" className="bg-slate-950/50 border-white/10 text-white" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleSubmitWork} disabled={!submitUrl || submitMilestone.isPending} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                          {submitMilestone.isPending ? "Submitting..." : "Submit Trade Documents"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}

                {/* 3. Importer Verifies Shipping Documents & Releases Escrow */}
                {isClient && currentStep === 2 && (
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg font-semibold gap-2 w-full sm:w-auto" onClick={() => handleApproveWork(m.id)}>
                      <Check className="w-4 h-4" /> Verify & Release Payout
                    </Button>
                    <Button variant="outline" className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10 font-semibold w-full sm:w-auto" onClick={() => requestRevision.mutate(m.id)} disabled={requestRevision.isPending}>
                      File Quality Dispute
                    </Button>
                  </div>
                )}

                {/* Wait notification */}
                {isTalent && currentStep === 0 && (
                  <span className="text-xs text-white/40 bg-slate-900 border border-white/5 px-3 py-2 rounded-lg">Awaiting Importer Escrow Deposit</span>
                )}
                {isTalent && currentStep === 2 && (
                  <span className="text-xs text-white/40 bg-slate-900 border border-white/5 px-3 py-2 rounded-lg">Awaiting Importer Clearance & Release</span>
                )}
                {currentStep === 3 && (
                  <span className="text-xs text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 px-3 py-2 rounded-lg font-semibold flex items-center gap-1">✓ Escrow Released & Settled</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contract terms & Specifications Details */}
      <Card className="border-border/50 bg-[#0b1426]/30 border-white/5">
        <CardHeader className="border-b border-white/5 bg-[#0b1426]/50">
          <CardTitle className="text-lg text-white">Trade Terms & Contract Specifications</CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div>
            <p className="whitespace-pre-wrap text-white/70 leading-relaxed bg-slate-950/30 p-6 rounded-xl border border-white/5">{project.description}</p>
          </div>

          {project.documentUrl && (
            <div>
              <h3 className="text-sm font-semibold mb-3 text-white">Master Purchase Contract File</h3>
              <a href={project.documentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 p-4 border border-white/10 rounded-xl bg-slate-950/20 hover:bg-slate-950/40 transition-colors w-full md:w-auto">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-white text-sm">Master_Contract.pdf</p>
                  <p className="text-xs text-white/40 mt-0.5">Click to view or download master agreement</p>
                </div>
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom Payment Escrow Account metrics & Chat Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Escrow summary */}
        {escrow && (
          <Card className="border-border/50 bg-[#0b1426]/30 border-white/5">
            <CardHeader className="bg-[#0b1426]/50 border-b border-white/5 pb-4">
              <CardTitle className="text-white text-md">Escrow Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-white/50 text-sm">Total Vault Value:</span>
                  <span className="text-white font-semibold font-mono">{formatMoney(escrow.totalAmount)}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-white/50 text-sm">Released to Exporter:</span>
                  <span className="text-emerald-400 font-semibold font-mono">{formatMoney(escrow.releasedAmount)}</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-white/50 text-sm">Remaining Locked:</span>
                  <span className="text-amber-500 font-semibold font-mono">{formatMoney(escrow.remainingAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chat / Messages Panel */}
        <Card className="border-border/50 bg-[#0b1426]/30 border-white/5 flex flex-col h-[280px] overflow-hidden">
          <CardHeader className="bg-[#0b1426]/50 border-b border-white/5 py-3 px-6 flex flex-row items-center gap-2">
            <MessageCircle className="w-4 h-4 text-blue-400" />
            <CardTitle className="text-white text-sm">Project Communication Chat</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
            {/* Message lists */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {chatMessages.length === 0 ? (
                <div className="text-center text-white/30 text-xs py-8">Send a secure message to start the negotiation</div>
              ) : (
                chatMessages.map((msg, i) => {
                  const isCurrentUser = msg.senderId === user?.id;
                  return (
                    <div key={i} className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                      <div className={`p-2.5 rounded-xl max-w-[85%] text-xs ${isCurrentUser ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-900 border border-white/10 text-white/90 rounded-bl-none'}`}>
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-white/30 mt-1 px-1">
                        {isCurrentUser ? 'You' : msg.senderName || 'Partner'}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input message */}
            <div className="p-3 border-t border-white/5 bg-slate-950/20 flex gap-2">
              <Input
                className="bg-slate-950/50 border-white/10 text-white text-xs h-9"
                placeholder="Type a message..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              />
              <Button size="sm" onClick={handleSendMessage} className="h-9 px-3 bg-blue-600 hover:bg-blue-700 text-white" disabled={!chatInput.trim() || isSendingMsg}>
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
