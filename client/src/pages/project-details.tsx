import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
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
import { Lock, FileCheck, AlertCircle, Calendar, DollarSign, CheckCircle2, FileText, CreditCard, Share2, Check, User, Users, Clock, AlertTriangle, Copy, ExternalLink, Flag, Send, MessageCircle, ShieldCheck, Truck, Anchor, Upload, XCircle, Trophy, Sparkles, ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatMoney as formatMoneyByCurrency } from "@/lib/currencies";
import { format, isPast } from "date-fns";

export default function ProjectDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
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
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const prevMsgCount = useRef(0);
  const [isCreatingPaymentLink, setIsCreatingPaymentLink] = useState<string | null>(null);
  const { toast } = useToast();

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [importerFile, setImporterFile] = useState<File | null>(null);
  const [isUploadingImporter, setIsUploadingImporter] = useState(false);
  const [importerSubmitUrl, setImporterSubmitUrl] = useState("");
  const [isImporterSubmitOpen, setIsImporterSubmitOpen] = useState(false);
  const [isReleasingEscrow, setIsReleasingEscrow] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"qr" | "verifying" | "success">("qr");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadFile(file);
      setIsUploadingFile(true);
      try {
        const formData = new FormData();
        formData.append("document", file);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          setSubmitUrl(data.url);
          toast({ title: "Success", description: "File uploaded successfully. Click Submit to save." });
        } else {
          toast({ title: "Upload Failed", description: "Failed to upload file", variant: "destructive" });
        }
      } catch (err) {
        toast({ title: "Error", description: "Network error during upload", variant: "destructive" });
      } finally {
        setIsUploadingFile(false);
      }
    }
  };

  const handleImporterFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImporterFile(file);
      setIsUploadingImporter(true);
      try {
        const formData = new FormData();
        formData.append("document", file);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          setImporterSubmitUrl(data.url);
          toast({ title: "Success", description: "Bill of Entry uploaded successfully. Click Submit to save." });
        } else {
          toast({ title: "Upload Failed", description: "Failed to upload file", variant: "destructive" });
        }
      } catch (err) {
        toast({ title: "Error", description: "Network error during upload", variant: "destructive" });
      } finally {
        setIsUploadingImporter(false);
      }
    }
  };

  const handleImporterSubmit = async () => {
    if (!selectedMilestoneId || !importerSubmitUrl) return;
    try {
      const res = await fetch(`/api/milestones/${selectedMilestoneId}/submit-importer-doc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionUrl: importerSubmitUrl }),
      });
      if (res.ok) {
        setIsImporterSubmitOpen(false);
        setImporterSubmitUrl("");
        setImporterFile(null);
        queryClient.invalidateQueries({ queryKey: ['/api/projects/:id', id] });
        toast({ title: "Success", description: "Bill of Entry document submitted successfully!" });
      } else {
        toast({ title: "Error", description: "Failed to submit document", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Network error", variant: "destructive" });
    }
  };

  const openSubmitDialog = (milestoneId: string) => {
    setSelectedMilestoneId(milestoneId);
    setUploadFile(null);
    setSubmitUrl("");
    setIsSubmitOpen(true);
  };

  const openImporterDialog = (milestoneId: string) => {
    setSelectedMilestoneId(milestoneId);
    setImporterFile(null);
    setImporterSubmitUrl("");
    setIsImporterSubmitOpen(true);
  };

  const handleShare = () => {
    setIsShareOpen(true);
  };

  const formatDocUrl = (url: string) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) return url;
    return `https://${url}`;
  };

  const handleDeleteDoc = async (milestoneId: string, docType: 'exporter' | 'importer') => {
    try {
      const res = await fetch(`/api/milestones/${milestoneId}/delete-doc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docType }),
      });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/projects/:id', id] });
        toast({
          title: "Document Deleted",
          description: "The uploaded document has been removed. You can now upload a new file.",
        });
      } else {
        toast({ title: "Error", description: "Failed to delete document", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Network error during delete", variant: "destructive" });
    }
  };

  // Pre-load selected milestone ID for uploads at top level
  useEffect(() => {
    const firstM = data?.milestones?.[0];
    if (firstM?.id && !selectedMilestoneId) {
      setSelectedMilestoneId(firstM.id);
    }
  }, [data?.milestones]);

  // Fetch chat messages and poll every 3s
  useEffect(() => {
    if (!id) return;
    const fetchMsgs = async () => {
      try {
        const res = await fetch(`/api/projects/${id}/messages`, { credentials: 'include' });
        if (res.ok) setChatMessages(await res.json());
      } catch { }
    };
    fetchMsgs();
    const interval = setInterval(fetchMsgs, 3000);
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

  if (isLoading) return <div className="p-8 text-center text-slate-500 animate-pulse">Loading project details...</div>;
  if (!data || !data.project) return <div className="p-8 text-center text-destructive">Project not found.</div>;

  const { project, milestones, escrow, clientName, talentName } = data;

  // Participant Checks based strictly on project record (not generic roles)
  const isClient = user?.id === project.buyerId;
  const isTalent = user?.id === project.freelancerId;
  const isParticipant = project.createdBy === user?.id || isClient || isTalent;

  // Clean, custom B2B display names
  const loggedInUserName = user ? ([user.firstName, user.lastName].filter(Boolean).join(' ').trim() || (user.email ? user.email.split('@')[0] : '')) : '';
  const displayClientName = (isClient && loggedInUserName) ? loggedInUserName : (clientName === 'Awaiting Buyer' || clientName === 'Awaiting Importer' ? 'Awaiting Importer' : clientName);
  const displayTalentName = (isTalent && loggedInUserName) ? loggedInUserName : (talentName === 'Awaiting Freelancer' || talentName === 'Awaiting Exporter' ? 'Awaiting Exporter' : talentName);

  const formatMoney = (cents: number): string => formatMoneyByCurrency(cents, project.currency || 'USD');
  const totalAmountCents = escrow?.totalAmount || milestones?.reduce((acc, m) => acc + (m.amount || 0), 0) || (project as any).budget || 5000000;

  const handleFinishPayment = async () => {
    setPaymentStep("verifying");
    setTimeout(() => {
      setPaymentStep("success");
      setTimeout(async () => {
        setIsQrModalOpen(false);
        setPaymentStep("qr");
        await fundProject.mutateAsync(project.id);
      }, 1500);
    }, 1500);
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
          setUploadFile(null);
          queryClient.invalidateQueries({ queryKey: ['/api/projects/:id', project.id] });
        }
      });
    }
  };

  // Determine active logistics step (0 to 5)
  const invoiceMilestone = milestones?.find(m => m.title === "Commercial Invoice & Packing List");
  const qcMilestone = milestones?.find(m => m.title === "Quality Certificate (SGS Inspection)");
  const bolMilestone = milestones?.find(m => m.title === "Bill of Lading (BoL) / Shipping Receipt");
  const beMilestone = milestones?.find(m => m.title === "Import customs declaration (Bill of Entry)");

  const isCiUploaded = !!invoiceMilestone?.submissionUrl;
  const isQcUploaded = !!qcMilestone?.submissionUrl;
  const isInitialExporterDocsUploaded = (!invoiceMilestone || isCiUploaded);

  const isEscrowFunded = !!escrow?.funded;

  const isBolUploaded = !!bolMilestone?.submissionUrl;
  const isBeUploaded = !!beMilestone?.importerSubmissionUrl;

  const allExporterSubmitted = isCiUploaded && isQcUploaded && isBolUploaded;

  const fallbackMilestone = milestones?.[0];
  const m = beMilestone || fallbackMilestone;

  const isCompleted = project.status === 'COMPLETED' || (milestones && milestones.length > 0 && milestones.every(m => m.status === 'RELEASED' || m.status === 'APPROVED'));

  const hasBothParticipants = !!project.buyerId && !!project.freelancerId;
  let currentStep = 0;
  if (isCompleted || (isBeUploaded && isBolUploaded && isQcUploaded && isEscrowFunded)) {
    currentStep = 5;
  } else if (isBolUploaded && isQcUploaded && isEscrowFunded) {
    currentStep = 4;
  } else if (isEscrowFunded) {
    currentStep = 3;
  } else if (isInitialExporterDocsUploaded) {
    currentStep = 2;
  } else if (hasBothParticipants) {
    currentStep = 1;
  }

  const handleReleaseEscrow = async () => {
    setIsReleasingEscrow(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/release-escrow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to release escrow funds');
      queryClient.invalidateQueries({ queryKey: ['/api/projects/:id', project.id] });
      toast({
        title: 'Escrow Funds Released! 🎉',
        description: 'The trade escrow funds have been successfully disbursed to the Exporter and the contract is now completed.',
      });
    } catch (err) {
      toast({ title: 'Error', description: 'Network error during escrow release', variant: 'destructive' });
    } finally {
      setIsReleasingEscrow(false);
    }
  };

  const handleApproveAll = async () => {
    await handleReleaseEscrow();
  };

  const handleRejectAll = async () => {
    if (!milestones) return;
    try {
      for (const milestone of milestones) {
        if (milestone.status !== 'RELEASED' && milestone.status !== 'APPROVED') {
          await requestRevision.mutateAsync(milestone.id);
        }
      }
      queryClient.invalidateQueries({ queryKey: ['/api/projects/:id', project.id] });
      toast({ title: 'Revision Requested', description: 'All pending milestones have been requested for revision.' });
    } catch (err) {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' });
    }
  };

  // Invitation Workspace view for unjoined users (Figma Wireframe Inspired)
  // Determine what role the joining user will get
  const joiningAs = !project.buyerId ? 'Importer (Buyer)' : !project.freelancerId ? 'Exporter (Seller)' : 'Trade Partner';
  const joiningAsColor = !project.buyerId ? 'text-blue-700 bg-blue-50 border-blue-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200';

  if (!isParticipant && project.status === 'WAITING_FOR_ACCEPTANCE') {
    return (
      <div className="max-w-md mx-auto py-12 px-4 animate-in fade-in duration-300">
        <Card className="border border-slate-200 bg-white shadow-sm rounded-xl">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl font-bold text-slate-900">Join Trade Contract</CardTitle>
            <p className="text-xs text-slate-500 mt-1">You have been invited to join this trade escrow workspace.</p>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Contract Title</p>
              <h3 className="text-sm font-bold text-slate-900">{project.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">{project.description}</p>
              <p className="text-xs text-slate-500 mt-2">
                Created by: <span className="font-semibold text-slate-800">{displayClientName || displayTalentName || 'Trade Partner'}</span>
              </p>
            </div>

            {/* Role badge — shows what role the user will take on joining */}
            <div className={`flex items-center gap-3 p-3 rounded-xl border ${joiningAsColor}`}>
              <Users className="w-4 h-4 shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">You will join as</p>
                <p className="text-sm font-bold">{joiningAs}</p>
              </div>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!joinCode.trim()) return;
              try {
                const joined = await joinProject.mutateAsync(joinCode.trim().toUpperCase());
                toast({ title: "Joined!", description: "You have successfully joined the trade contract." });
                queryClient.invalidateQueries({ queryKey: ['/api/projects/:id', project.id] });
                // Redirect to force full project view to reload
                setLocation(`/projects/${project.id}`);
              } catch (err) { }
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="joinCode" className="text-slate-700 text-xs uppercase font-bold tracking-wider">Enter Join Code</Label>
                <Input
                  id="joinCode"
                  placeholder="6-CHARACTER CODE"
                  className="h-12 text-center text-lg tracking-widest font-mono bg-slate-50 border-slate-200 text-slate-900 font-bold focus:border-blue-500"
                  value={joinCode || project.projectCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                />
              </div>
              <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all" disabled={joinProject.isPending || (joinCode || project.projectCode).length < 6}>
                {joinProject.isPending ? "Joining Workspace..." : "Accept & Join Contract"}
              </Button>
            </form>

            <div className="text-center pt-1">
              <a href="/projects/new" className="text-xs text-slate-400 hover:text-blue-600 font-semibold underline underline-offset-2 transition-colors">
                Create your own escrow contract instead →
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 w-full animate-in fade-in duration-500">

      {/* Top Header Section (Figma Inspired Clean White Header) */}
      <Card className="border border-slate-100 shadow-sm overflow-hidden bg-white rounded-xl">
        <div className="p-6 md:p-8 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">Trade: {project.title}</h1>
                <StatusBadge status={project.status} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-slate-400 font-medium text-xs">Trade ID:</span>
                <span className="font-mono text-slate-600 font-semibold text-xs tracking-wider uppercase">{project.projectCode}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(project.projectCode);
                    toast({ title: "Copied!", description: "Trade code copied to clipboard." });
                  }}
                  className="text-blue-600 hover:text-blue-700 ml-1.5 hover:underline flex items-center gap-0.5 text-xs font-bold"
                  title="Copy Code"
                >
                  <Copy className="w-3 h-3" /> Copy Link
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" onClick={handleShare} className="gap-2 border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-all font-semibold rounded-lg text-xs shadow-sm h-9">
                <Share2 className="w-4 h-4 text-slate-500" /> Share
              </Button>
            </div>
          </div>
        </div>

        {/* Metadata Row (Clean spacious columns separated by slate border) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 md:p-8 bg-slate-50/50 border-t border-slate-100">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Importer (Buyer)</p>
            <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm">
              <Users className="w-4 h-4 text-slate-400" /> {displayClientName}
              {isClient && (
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 ml-1">You</span>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Exporter (Seller)</p>
            <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm">
              <User className="w-4 h-4 text-slate-400" /> {displayTalentName}
              {isTalent && (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 ml-1">You</span>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Due Date</p>
            <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm">
              <Calendar className="w-4 h-4 text-slate-400" />
              {project.expiresAt ? format(new Date(project.expiresAt), 'MMM d, yyyy') : 'TBD'}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Priority</p>
            <div className="flex items-center gap-2 font-bold text-amber-600 text-sm">
              <Clock className="w-4 h-4 text-amber-500" /> High
            </div>
          </div>
        </div>
      </Card>

      {/* Visual Cargo Tracker (Figma Inspired Workflow Stages Card) */}
      <Card className="border border-slate-100 shadow-sm p-6 md:p-8 bg-white rounded-xl">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-400 mb-6">Workflow Stages</h3>
        <div className="overflow-x-auto -mx-1 px-1 pb-2">
          <div className="flex items-center justify-between relative min-w-[500px] max-w-4xl mx-auto pt-2 pb-4">
            {/* Connector Line */}
            <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-slate-100 -translate-y-[28px] z-0"></div>
            <div className="absolute top-1/2 left-0 h-[2px] bg-emerald-500 -translate-y-[28px] z-0 transition-all duration-1000" style={{ width: `${(Math.min(currentStep, 5) / 5) * 100}%` }}></div>

            {[
              { label: "Access", icon: FileText, num: 1 },
              { label: "Commercial Invoice", icon: Send, num: 2 },
              { label: "Fund Escrow", icon: CreditCard, num: 3 },
              { label: "Quality & BoL", icon: Anchor, num: 4 },
              { label: "Bill of Entry", icon: FileCheck, num: 5 },
              { label: "Completed", icon: CheckCircle2, num: 6 },
            ].map((step, idx) => {
              let isStepDone = false;
              let isStepCurrent = false;

              if (idx === 0) {
                isStepDone = hasBothParticipants;
                isStepCurrent = currentStep === 0;
              } else if (idx === 1) {
                isStepDone = currentStep >= 2;
                isStepCurrent = currentStep === 1;
              } else if (idx === 2) {
                isStepDone = currentStep >= 3;
                isStepCurrent = currentStep === 2;
              } else if (idx === 3) {
                isStepDone = currentStep >= 4;
                isStepCurrent = currentStep === 3;
              } else if (idx === 4) {
                isStepDone = currentStep >= 5;
                isStepCurrent = currentStep === 4;
              } else if (idx === 5) {
                isStepDone = isCompleted || currentStep === 5;
                isStepCurrent = currentStep === 5;
              }

              return (
                <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${isStepDone ? "bg-emerald-500 text-white shadow-sm" :
                    isStepCurrent ? "bg-blue-600 text-white shadow-md ring-4 ring-blue-100" :
                      "bg-slate-100 text-slate-400 border border-slate-200"
                    }`}>
                    {isStepDone ? <Check className="w-4 h-4 text-white" /> : <span className="text-xs">{step.num}</span>}
                  </div>
                  <span className={`text-[11px] font-semibold tracking-wide transition-all ${isStepCurrent ? "text-blue-600 font-bold" :
                    isStepDone ? "text-emerald-600" :
                      "text-slate-400"
                    }`}>{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Action Center CTA Banner (Clean Sapphire Blue Alert at the top of the workflow page) */}
      {m && !isCompleted && (
        <div className="p-6 rounded-xl border border-blue-100 bg-blue-50/60 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-blue-500 uppercase tracking-widest font-bold">Action Required</p>
              <h4 className="text-sm font-bold text-blue-900 mt-0.5">
                {currentStep === 0 ? "Awaiting Partner to Join Contract" :
                  currentStep === 1 ? (isTalent ? "Upload Commercial Invoice (CI)" : "Awaiting Exporter Commercial Invoice (CI)") :
                    currentStep === 2 ? (isClient ? "Commercial Invoice Received — Deposit Funds to Escrow" : "Awaiting Importer Escrow Funding") :
                      currentStep === 3 ? (isTalent ? "Escrow Secured — Upload Quality Certificate & Bill of Lading" : "Escrow Secured — Awaiting Quality Cert & BoL") :
                        currentStep === 4 ? (isClient ? (!beMilestone?.importerSubmissionUrl ? "Upload Import customs declaration (Bill of Entry)" : "Audit Documentation Checklist & Verify") : "Awaiting Importer Customs Declaration") :
                          "Trade Documents Approved & Completed"}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {currentStep === 0 && (
                  "Please share the project code with your trade partner so they can join this contract workspace."
                )}
                {currentStep === 1 && (
                  isClient ? "Waiting for the Exporter (Seller) to upload the Commercial Invoice." :
                    isTalent ? "You are the Exporter. Please upload Commercial Invoice to proceed." :
                      "Waiting for Exporter (Seller) to upload Commercial Invoice."
                )}
                {currentStep === 2 && (
                  isClient ? (
                    "The Exporter has uploaded Commercial Invoice. Please deposit funds into Escrow so the Exporter can upload the Quality Certificate and Bill of Lading."
                  ) :
                    isTalent ? "You have uploaded Commercial Invoice. Waiting for the Importer to deposit funds into Escrow before you can submit Quality Certificate & Bill of Lading." :
                      "Awaiting Importer (Buyer) Escrow deposit."
                )}
                {currentStep === 3 && (
                  isClient ? "Escrow funds are secured. Waiting for the Exporter (Seller) to upload the Quality Certificate (SGS) and Bill of Lading (BoL)." :
                    isTalent ? "Funds are secured in Escrow! Please upload the Quality Certificate (SGS) and Bill of Lading (BoL)." :
                      "Escrow secured. Waiting for Quality Certificate & Bill of Lading."
                )}
                {currentStep === 4 && (
                  isClient ? (
                    !beMilestone?.importerSubmissionUrl
                      ? "Quality Certificate and Bill of Lading have been submitted. Please upload your Import customs declaration (Bill of Entry) to complete trade verification."
                      : "You are the Importer. All cargo and import documents have been uploaded. Please audit and approve to release funds."
                  ) :
                    isTalent ? "Documents submitted. Waiting for the Importer to upload Bill of Entry and audit final documents." :
                      "Awaiting Importer customs verification."
                )}
                {currentStep === 5 && "This contract has been fully verified and completed."}
              </p>
            </div>
          </div>
          <div className="w-full md:w-auto flex justify-end">
            {/* Step 2 CTA: Importer Deposits Funds to Escrow */}
            {isClient && currentStep === 2 && (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-lg shadow-sm transition-all w-full md:w-auto text-xs tracking-wide"
                onClick={() => setIsQrModalOpen(true)}
                disabled={fundProject.isPending}
              >
                <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                {fundProject.isPending ? "Securing Escrow..." : "Deposit Funds to Escrow"}
              </Button>
            )}

            {/* Step 3 CTA: Exporter Uploads Quality Certificate & BoL */}
            {isTalent && currentStep === 3 && (
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                {qcMilestone && !qcMilestone.submissionUrl && (
                  <Button
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2.5 rounded-lg shadow-sm transition-all text-xs tracking-wide"
                    onClick={() => openSubmitDialog(qcMilestone.id)}
                  >
                    <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload Quality Cert
                  </Button>
                )}
                {bolMilestone && !bolMilestone.submissionUrl && (
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-lg shadow-sm transition-all text-xs tracking-wide"
                    onClick={() => openSubmitDialog(bolMilestone.id)}
                  >
                    <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload BoL
                  </Button>
                )}
              </div>
            )}

            {/* Step 4 CTA: Importer Uploads Bill of Entry & Verifies */}
            {isClient && currentStep === 4 && (
              <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto">
                {beMilestone && !beMilestone.importerSubmissionUrl ? (
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-lg shadow-sm transition-all w-full md:w-auto text-xs tracking-wide" onClick={() => openImporterDialog(beMilestone.id)}>
                    <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload Bill of Entry
                  </Button>
                ) : (
                  <>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-lg shadow-sm transition-all w-full md:w-auto text-xs tracking-wide" onClick={handleApproveAll}>
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Approve & Verify All Docs
                    </Button>
                    <Button variant="outline" className="border-red-200 text-red-650 hover:bg-red-50 font-bold px-6 py-2.5 rounded-lg shadow-sm transition-all w-full md:w-auto text-xs tracking-wide" onClick={handleRejectAll}>
                      <XCircle className="w-3.5 h-3.5 mr-1.5" /> Request Revision
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* Status indicators */}
            {isTalent && currentStep === 0 && (
              <span className="text-xs text-slate-500 bg-slate-100 border border-slate-200 px-4 py-2.5 rounded-lg font-semibold">Awaiting Partner to Join</span>
            )}
            {isTalent && currentStep === 2 && (
              <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-lg font-semibold">
                Awaiting Importer Escrow Funding
              </span>
            )}
            {currentStep === 5 && (
              <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-lg font-bold flex items-center gap-1 shadow-sm">
                ✓ Documents Approved & Verified
              </span>
            )}
          </div>
        </div>
      )}

      {/* Congratulations Card shown when trade completed */}
      {isCompleted && (
        <Card className="border border-emerald-200 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/50 shadow-md rounded-xl p-6 md:p-8 relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/40 rounded-full blur-2xl -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-100/30 rounded-full blur-2xl -ml-16 -mb-16"></div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0 transform hover:scale-105 transition-transform duration-300">
                <Trophy className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <span className="text-[10px] text-emerald-600 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Completed</span>
                  <span className="text-[10px] text-teal-600 bg-teal-100 border border-teal-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-0.5"><Sparkles className="w-2.5 h-2.5" /> Confirmed</span>
                </div>
                <h2 className="text-lg md:text-xl font-bold text-slate-900 mt-2">Congratulations! Trade Successfully Completed</h2>
                <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
                  All cargo shipping documents and customs declarations have been audited and verified. The escrow funds have been safely released to the Exporter. Thank you for using Pax for a secure B2B trade.
                </p>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <div className="text-right hidden sm:block mr-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Escrow Status</p>
                <p className="text-sm font-bold text-emerald-600">100% Disbursed</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-250 flex items-center justify-center text-emerald-600 font-bold shadow-sm">
                ✓
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Unified Document Checklist & Vault (Clean light bordered design) */}
      {m && (
        <Card className="border border-slate-100 shadow-sm overflow-hidden bg-white rounded-xl">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6">
            <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-600" /> Required Cargo Documentation Checklist
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100 font-bold">
                  <tr>
                    <th className="px-6 py-3">Document Type</th>
                    <th className="px-6 py-3">Required By</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoiceMilestone || bolMilestone || qcMilestone || beMilestone ? (
                    <>
                      {invoiceMilestone && (
                        <tr className="hover:bg-slate-50/40 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-900">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                CI
                              </div>
                              {invoiceMilestone.submissionUrl ? (
                                <a href={formatDocUrl(invoiceMilestone.submissionUrl)} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline">
                                  Commercial Invoice & Packing List
                                </a>
                              ) : (
                                <span>Commercial Invoice & Packing List</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-xs font-semibold">Exporter ({displayTalentName})</td>
                          <td className="px-6 py-4">
                            {invoiceMilestone.submissionUrl ? (
                              <a href={formatDocUrl(invoiceMilestone.submissionUrl)} target="_blank" rel="noopener noreferrer">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-colors">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                  ✓ Uploaded
                                </span>
                              </a>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                ⏳ Pending Upload
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {invoiceMilestone.submissionUrl ? (
                              <div className="flex items-center justify-end gap-2">
                                <a href={formatDocUrl(invoiceMilestone.submissionUrl)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 hover:underline font-bold bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                                  View File <ExternalLink className="w-3 h-3" />
                                </a>
                                {isTalent && (
                                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs px-2.5 py-1.5 h-auto font-semibold border border-red-100" onClick={() => handleDeleteDoc(invoiceMilestone.id, 'exporter')} title="Delete & Re-upload">
                                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                                  </Button>
                                )}
                              </div>
                            ) : isTalent && currentStep === 1 ? (
                              <Button variant="outline" className="text-xs border-blue-200 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg h-auto" onClick={() => openSubmitDialog(invoiceMilestone.id)}>
                                <Upload className="w-3 h-3 mr-1" /> Upload
                              </Button>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                        </tr>
                      )}

                      {qcMilestone && (
                        <tr className="hover:bg-slate-50/40 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-900">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">
                                QC
                              </div>
                              {qcMilestone.submissionUrl ? (
                                <a href={formatDocUrl(qcMilestone.submissionUrl)} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline">
                                  Quality Certificate (SGS Inspection)
                                </a>
                              ) : (
                                <span>Quality Certificate (SGS Inspection)</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-xs font-semibold">Exporter ({displayTalentName})</td>
                          <td className="px-6 py-4">
                            {qcMilestone.submissionUrl ? (
                              <a href={formatDocUrl(qcMilestone.submissionUrl)} target="_blank" rel="noopener noreferrer">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-colors">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                  ✓ Certified
                                </span>
                              </a>
                            ) : !isCiUploaded ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                                ⏳ Awaiting Commercial Invoice
                              </span>
                            ) : !isEscrowFunded ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100">
                                ⏳ Awaiting Escrow Deposit
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                                ⏳ Pending Upload
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {qcMilestone.submissionUrl ? (
                              <div className="flex items-center justify-end gap-2">
                                <a href={formatDocUrl(qcMilestone.submissionUrl)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 hover:underline font-bold bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                                  View File <ExternalLink className="w-3 h-3" />
                                </a>
                                {isTalent && (
                                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs px-2.5 py-1.5 h-auto font-semibold border border-red-100" onClick={() => handleDeleteDoc(qcMilestone.id, 'exporter')} title="Delete & Re-upload">
                                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                                  </Button>
                                )}
                              </div>
                            ) : isTalent ? (
                              isEscrowFunded ? (
                                <Button variant="outline" className="text-xs border-blue-200 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg h-auto font-bold" onClick={() => openSubmitDialog(qcMilestone.id)}>
                                  <Upload className="w-3 h-3 mr-1" /> Upload
                                </Button>
                              ) : (
                                <span className="text-xs text-slate-400 italic font-medium">Awaiting Escrow Deposit</span>
                              )
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                        </tr>
                      )}

                      {bolMilestone && (
                        <tr className="hover:bg-slate-50/40 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-900">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                BL
                              </div>
                              {bolMilestone.submissionUrl ? (
                                (isClient && !isEscrowFunded) ? (
                                  <div className="flex flex-col">
                                    <span className="text-slate-400 font-semibold flex items-center gap-2">
                                      <span>Bill of Lading (BoL) / Shipping Receipt</span>
                                      <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-amber-200">
                                        🔒 Locked & Blurred
                                      </span>
                                    </span>
                                    <span className="text-[11px] text-amber-700 font-normal filter blur-[3px] select-none pointer-events-none mt-0.5">
                                      bol_shipping_receipt_confidential_document.pdf
                                    </span>
                                  </div>
                                ) : (
                                  <a href={formatDocUrl(bolMilestone.submissionUrl)} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline">
                                    Bill of Lading (BoL) / Shipping Receipt
                                  </a>
                                )
                              ) : (
                                <span>Bill of Lading (BoL) / Shipping Receipt</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-xs font-semibold">Exporter ({displayTalentName})</td>
                          <td className="px-6 py-4">
                            {bolMilestone.submissionUrl ? (
                              (isClient && !isEscrowFunded) ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                  <Lock className="w-3 h-3 text-amber-600" />
                                  🔒 Blurred (Escrow Required)
                                </span>
                              ) : (
                                <a href={formatDocUrl(bolMilestone.submissionUrl)} target="_blank" rel="noopener noreferrer">
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-colors">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    ✓ Uploaded
                                  </span>
                                </a>
                              )
                            ) : !isInitialExporterDocsUploaded ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                                ⏳ Awaiting Commercial Invoice
                              </span>
                            ) : !isEscrowFunded ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100">
                                ⏳ Awaiting Escrow Deposit
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                ⏳ Pending Upload
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {bolMilestone.submissionUrl ? (
                              (isClient && !isEscrowFunded) ? (
                                <Button
                                  variant="outline"
                                  className="text-xs bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100 px-3 py-1.5 rounded-lg h-auto font-bold shadow-sm"
                                  onClick={() => setIsQrModalOpen(true)}
                                  disabled={fundProject.isPending}
                                >
                                  <Lock className="w-3 h-3 mr-1 text-amber-600" />
                                  {fundProject.isPending ? "Securing Escrow..." : "Deposit to Escrow to Unblur"}
                                </Button>
                              ) : (
                                <div className="flex items-center justify-end gap-2">
                                  <a href={formatDocUrl(bolMilestone.submissionUrl)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 hover:underline font-bold bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                                    View File <ExternalLink className="w-3 h-3" />
                                  </a>
                                  {isTalent && (
                                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs px-2.5 py-1.5 h-auto font-semibold border border-red-100" onClick={() => handleDeleteDoc(bolMilestone.id, 'exporter')} title="Delete & Re-upload">
                                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                                    </Button>
                                  )}
                                </div>
                              )
                            ) : isTalent ? (
                              isEscrowFunded ? (
                                <Button variant="outline" className="text-xs border-blue-200 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg h-auto font-bold" onClick={() => openSubmitDialog(bolMilestone.id)}>
                                  <Upload className="w-3 h-3 mr-1" /> Upload
                                </Button>
                              ) : (
                                <span className="text-xs text-slate-400 italic font-medium">Awaiting Escrow Deposit</span>
                              )
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                        </tr>
                      )}

                      {beMilestone && (
                        <tr className="hover:bg-slate-50/40 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-900">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-bold text-xs">
                                BE
                              </div>
                              {beMilestone.importerSubmissionUrl ? (
                                <a href={formatDocUrl(beMilestone.importerSubmissionUrl)} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline">
                                  Import customs declaration (Bill of Entry)
                                </a>
                              ) : (
                                <span>Import customs declaration (Bill of Entry)</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-xs font-semibold">Importer ({displayClientName})</td>
                          <td className="px-6 py-4">
                            {beMilestone.importerSubmissionUrl ? (
                              <a href={formatDocUrl(beMilestone.importerSubmissionUrl)} target="_blank" rel="noopener noreferrer">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-colors">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                  ✓ Uploaded
                                </span>
                              </a>
                            ) : isBolUploaded && isEscrowFunded ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                ⏳ Pending Upload
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200 font-medium">
                                ⏳ Awaiting Shipping Docs & Escrow
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right font-medium">
                            {beMilestone.importerSubmissionUrl ? (
                              <div className="flex items-center justify-end gap-2">
                                <a href={formatDocUrl(beMilestone.importerSubmissionUrl)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 hover:underline font-bold bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                                  View File <ExternalLink className="w-3 h-3" />
                                </a>
                                {isClient && (
                                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs px-2.5 py-1.5 h-auto font-semibold border border-red-100" onClick={() => handleDeleteDoc(beMilestone.id, 'importer')} title="Delete & Re-upload">
                                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                                  </Button>
                                )}
                              </div>
                            ) : isClient && currentStep === 4 ? (
                              <Button variant="outline" className="text-xs border-blue-200 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg h-auto font-bold" onClick={() => openImporterDialog(beMilestone.id)}>
                                <Upload className="w-3 h-3 mr-1" /> Upload
                              </Button>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
                  ) : (
                    <tr className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                            CI
                          </div>
                          {m.submissionUrl ? (
                            <a href={m.submissionUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline">
                              {m.title}
                            </a>
                          ) : (
                            <span>{m.title}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs font-semibold">Exporter ({displayTalentName})</td>
                      <td className="px-6 py-4">
                        {m.submissionUrl ? (
                          <a href={m.submissionUrl} target="_blank" rel="noopener noreferrer">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-colors">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              ✓ Uploaded
                            </span>
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            ⏳ Pending Upload
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {m.submissionUrl ? (
                          <a href={m.submissionUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 hover:underline font-bold bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                            View File <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : isTalent && currentStep === 1 ? (
                          <Button variant="outline" className="text-xs border-blue-200 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg h-auto" onClick={() => openSubmitDialog(m.id)}>
                            <Upload className="w-3 h-3 mr-1" /> Upload
                          </Button>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Document Warning or Overdue Info */}
            {m.status === 'PENDING' && isPast(new Date(m.deadline)) && (
              <div className="m-5 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
                <div>
                  <p className="font-bold text-sm">Late Cargo Documentation Alert</p>
                  <p className="text-xs mt-0.5 opacity-90">This trade contract has exceeded its delivery deadline. Please communicate with your partner via chat.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Importer Escrow Release Button Card (Shown when documents are uploaded but contract not completed) */}
      {isClient && !isCompleted && (
        <Card className="border border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 shadow-md rounded-xl p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Goods Received Confirmation & Escrow Release</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  After receiving your cargo shipment, click this button to confirm delivery and disburse escrow funds to the Exporter ({displayTalentName}).
                </p>
              </div>
            </div>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all text-xs tracking-wide shrink-0"
              onClick={handleReleaseEscrow}
              disabled={isReleasingEscrow}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {isReleasingEscrow ? "Releasing Payout..." : "Confirm Goods Received & Release Escrow Funds"}
            </Button>
          </div>
        </Card>
      )}

      {/* Contract terms & Specifications Details */}
      <Card className="border border-slate-100 shadow-sm overflow-hidden bg-white rounded-xl">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6">
          <CardTitle className="text-sm font-semibold text-slate-800">Trade Terms & Contract Specifications</CardTitle>
        </CardHeader>
        <CardContent className="p-6 md:p-8 space-y-6">
          <div>
            <p className="whitespace-pre-wrap text-slate-700 leading-relaxed bg-slate-50 p-6 rounded-xl border border-slate-100 text-sm">{project.description}</p>
          </div>

          {project.documentUrl && (
            <div>
              <h3 className="text-[10px] font-bold mb-3 text-slate-400 uppercase tracking-widest">Master Purchase Contract File</h3>
              <a href={project.documentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 p-4 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors w-full md:w-auto shadow-sm">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center border border-blue-100">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Master_Contract.pdf</p>
                  <p className="text-xs text-slate-400 mt-0.5">Click to view or download master agreement</p>
                </div>
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom Chat Panel */}
      <div className="grid grid-cols-1 gap-6">
        {/* Chat / Messages Panel */}
        <Card className="border border-slate-100 shadow-sm overflow-hidden bg-white rounded-xl flex flex-col h-[280px]">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3.5 px-6 flex flex-row items-center gap-2">
            <MessageCircle className="w-4 h-4 text-blue-600" />
            <CardTitle className="text-slate-850 text-sm font-semibold">Project Communication Chat</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
            {/* Message lists */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30">
              {chatMessages.length === 0 ? (
                <div className="text-center text-slate-400 text-xs py-8">Send a secure message to start the negotiation</div>
              ) : (
                chatMessages.map((msg, i) => {
                  const isCurrentUser = msg.senderId === user?.id;
                  return (
                    <div key={i} className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                      <div className={`p-2.5 rounded-xl max-w-[85%] text-xs leading-relaxed shadow-sm border ${isCurrentUser ? 'bg-blue-600 text-white border-blue-600 rounded-br-none' : 'bg-white border-slate-200 text-slate-800 rounded-bl-none'}`}>
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1 font-semibold">
                        {isCurrentUser ? 'You' : msg.senderName || 'Partner'}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input message */}
            <div className="p-3 border-t border-slate-100 bg-white flex gap-2">
              <Input
                className="bg-slate-50 border-slate-200 text-slate-900 text-xs h-9 focus:border-blue-500"
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

      {/* Exporter Upload Dialog */}
      <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
        <DialogContent className="bg-white border-slate-200 text-slate-950 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-bold">Upload Cargo Shipping Document</DialogTitle>
            <DialogDescription className="text-slate-500">
              Upload your document file or provide a link to it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-700">Choose Document File (PDF, Image, Doc)</Label>
              <div className="flex items-center gap-3">
                <label
                  htmlFor="dialogDocFile"
                  className="cursor-pointer flex items-center justify-center gap-2 text-sm px-4 py-3 rounded-lg border border-dashed border-border/70 bg-muted/30 hover:bg-muted/60 transition-colors text-muted-foreground w-full h-16"
                >
                  <Upload className="w-5 h-5" />
                  {uploadFile ? uploadFile.name : "Select file from device"}
                </label>
                <input
                  id="dialogDocFile"
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isUploadingFile}
                />
              </div>
              {isUploadingFile && <p className="text-xs text-blue-600 animate-pulse mt-1">Uploading file to platform...</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dialogDocUrl" className="text-slate-700">Or enter Document URL (Google Drive, Dropbox, MSC/Maersk Tracking link)</Label>
              <Input id="dialogDocUrl" value={submitUrl} onChange={e => setSubmitUrl(e.target.value)} placeholder="https://" className="bg-white border-slate-200 text-slate-900 focus:border-blue-500" disabled={isUploadingFile} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSubmitWork} disabled={!submitUrl || submitMilestone.isPending || isUploadingFile} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs">
              {submitMilestone.isPending ? "Submitting..." : "Submit Document"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Importer Upload Dialog */}
      <Dialog open={isImporterSubmitOpen} onOpenChange={setIsImporterSubmitOpen}>
        <DialogContent className="bg-white border-slate-200 text-slate-950 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-bold">Upload Import customs declaration (Bill of Entry)</DialogTitle>
            <DialogDescription className="text-slate-500">
              Choose a file from your device or enter the document URL.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-700">Choose Bill of Entry File</Label>
              <div className="flex items-center gap-3">
                <label
                  htmlFor="dialogImporterDocFile"
                  className="cursor-pointer flex items-center justify-center gap-2 text-sm px-4 py-3 rounded-lg border border-dashed border-border/70 bg-muted/30 hover:bg-muted/60 transition-colors text-muted-foreground w-full h-16"
                >
                  <Upload className="w-5 h-5" />
                  {importerFile ? importerFile.name : "Select file from device"}
                </label>
                <input
                  id="dialogImporterDocFile"
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={handleImporterFileChange}
                  disabled={isUploadingImporter}
                />
              </div>
              {isUploadingImporter && <p className="text-xs text-blue-600 animate-pulse mt-1">Uploading file to platform...</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dialogImporterDocUrl" className="text-slate-700">Or enter Document URL</Label>
              <Input id="dialogImporterDocUrl" value={importerSubmitUrl} onChange={e => setImporterSubmitUrl(e.target.value)} placeholder="https://" className="bg-white border-slate-200 text-slate-900 focus:border-blue-500" disabled={isUploadingImporter} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleImporterSubmit} disabled={!importerSubmitUrl || isUploadingImporter} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs">
              Submit Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code Escrow Payment Dialog */}
      <Dialog open={isQrModalOpen} onOpenChange={open => {
        if (!open && (paymentStep === "verifying" || paymentStep === "success")) return; // prevent closing during payment animation
        setIsQrModalOpen(open);
        if (!open) setPaymentStep("qr");
      }}>
        <DialogContent className="max-w-md max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-100 p-0 overflow-hidden flex flex-col justify-between">
          {paymentStep === "qr" && (
            <>
              <DialogHeader className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-bold text-white tracking-tight">PAX Escrow Vault — QR Payment</DialogTitle>
                    <DialogDescription className="text-xs text-slate-300 mt-0.5">
                      Deposit contract funds into secure escrow vault
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="p-5 space-y-4 bg-slate-50/50 overflow-y-auto max-h-[60vh]">
                {/* Amount Callout — Auto-calculated from project total */}
                <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Total Contract Amount</p>
                    <p className="text-2xl font-black text-emerald-950 mt-0.5">{formatMoney(totalAmountCents)}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-sm">
                      <ShieldCheck className="w-3 h-3 mr-1" /> 100% Protected
                    </span>
                  </div>
                </div>

                {/* QR Code Container */}
                <div className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-2.5">
                  <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-md">
                    <img 
                      src="/escrow-qr.png" 
                      alt="PAX Escrow GPay UPI QR Code" 
                      className="w-44 h-44 object-contain rounded-lg"
                    />
                  </div>
                  <p className="text-[11px] font-semibold text-slate-600 text-center leading-snug">
                    Scan with <span className="font-bold text-slate-900">GPay, PhonePe, Paytm</span> or any UPI App to deposit funds into Escrow Vault.
                  </p>
                </div>

                {/* Merchant / Trade Details */}
                <div className="bg-white border border-slate-200/60 rounded-xl p-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span className="font-medium">Trade Contract:</span>
                    <span className="font-bold text-slate-900 truncate max-w-[180px]">{project.title}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="font-medium">Escrow Beneficiary:</span>
                    <span className="font-bold text-slate-900">Exporter ({displayTalentName})</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="font-medium">Status:</span>
                    <span className="font-bold text-amber-600">⏳ Pending Deposit Confirmation</span>
                  </div>
                </div>
              </div>

              <DialogFooter className="bg-white p-4 px-6 border-t border-slate-200/60 shrink-0 sticky bottom-0 z-20">
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base rounded-xl py-3.5 shadow-lg transition-all"
                  onClick={handleFinishPayment}
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Finish Payment
                </Button>
              </DialogFooter>
            </>
          )}

          {paymentStep === "verifying" && (
            <div className="p-10 flex flex-col items-center justify-center text-center space-y-5 bg-slate-900 text-white min-h-[380px]">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-xl">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-white tracking-tight">Verifying Escrow Payment...</h3>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  Connecting to UPI banking network & validating transaction receipt for {formatMoney(totalAmountCents)}
                </p>
              </div>
            </div>
          )}

          {paymentStep === "success" && (
            <div className="p-10 flex flex-col items-center justify-center text-center space-y-5 bg-gradient-to-b from-emerald-600 to-teal-700 text-white min-h-[380px] animate-in fade-in zoom-in duration-300">
              <div className="w-24 h-24 rounded-full bg-white text-emerald-600 flex items-center justify-center shadow-2xl animate-bounce">
                <CheckCircle2 className="w-16 h-16 stroke-[2.5]" />
              </div>
              <div className="space-y-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-200" /> Payment Confirmed
                </span>
                <h3 className="text-2xl font-black text-white tracking-tight">Escrow Funds Secured! 🎉</h3>
                <p className="text-xs text-emerald-100 max-w-xs leading-relaxed font-medium">
                  {formatMoney(totalAmountCents)} has been successfully deposited into the PAX Escrow Vault.
                </p>
              </div>
              <div className="pt-2">
                <span className="text-[11px] font-bold tracking-wider uppercase bg-emerald-900/40 text-emerald-200 px-4 py-1.5 rounded-full border border-emerald-400/30 animate-pulse">
                  Unlocking Bill of Lading Stage...
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
