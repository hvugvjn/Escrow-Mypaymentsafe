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
import { Lock, FileCheck, AlertCircle, Calendar, DollarSign, CheckCircle2, FileText, CreditCard, Share2, Check, User, Users, Clock, AlertTriangle, Copy, ExternalLink, Flag, Send, MessageCircle, ShieldCheck, Truck, Anchor, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatMoney as formatMoneyByCurrency } from "@/lib/currencies";
import { format, isPast } from "date-fns";

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
        queryClient.invalidateQueries({ queryKey: ['/api/projects/:id', project.id] });
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

  // Pre-load selected milestone ID for uploads at top level
  useEffect(() => {
    const firstM = data?.milestones?.[0];
    if (firstM?.id && !selectedMilestoneId) {
      setSelectedMilestoneId(firstM.id);
    }
  }, [data?.milestones]);

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

  if (isLoading) return <div className="p-8 text-center text-slate-500 animate-pulse">Loading project details...</div>;
  if (!data || !data.project) return <div className="p-8 text-center text-destructive">Project not found.</div>;

  const { project, milestones, escrow, clientName, talentName } = data;
  
  // Participant Checks based strictly on project record (not generic roles)
  const isClient = user?.id === project.buyerId;
  const isTalent = user?.id === project.freelancerId;
  const isParticipant = project.createdBy === user?.id || isClient || isTalent;

  // Clean, custom B2B display names
  const displayClientName = clientName === 'Awaiting Buyer' ? 'Awaiting Importer' : clientName;
  const displayTalentName = talentName === 'Awaiting Freelancer' ? 'Awaiting Exporter' : talentName;

  const formatMoney = (cents: number): string => formatMoneyByCurrency(cents, project.currency || 'USD');

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

  // Determine active logistics step (0 to 3)
  const invoiceMilestone = milestones?.find(m => m.title === "Commercial Invoice & Packing List");
  const bolMilestone = milestones?.find(m => m.title === "Bill of Lading (BoL) / Shipping Receipt");
  const qcMilestone = milestones?.find(m => m.title === "Quality Certificate (SGS Inspection)");
  const beMilestone = milestones?.find(m => m.title === "Import customs declaration (Bill of Entry)");

  const exporterMilestones = milestones?.filter(m => m.title !== "Import customs declaration (Bill of Entry)") || [];
  const allExporterSubmitted = exporterMilestones.length > 0 && exporterMilestones.every(m => !!m.submissionUrl);

  const fallbackMilestone = milestones?.[0];
  const m = beMilestone || fallbackMilestone;

  const isCompleted = project.status === 'COMPLETED' || (milestones && milestones.length > 0 && milestones.every(m => m.status === 'RELEASED' || m.status === 'APPROVED'));

  const hasBothParticipants = !!project.buyerId && !!project.freelancerId;
  let currentStep = 0;
  if (isCompleted) {
    currentStep = 3;
  } else if (allExporterSubmitted) {
    currentStep = 2;
  } else if (hasBothParticipants) {
    currentStep = 1;
  }

  const handleApproveAll = async () => {
    if (!milestones) return;
    try {
      for (const milestone of milestones) {
        if (milestone.status !== 'RELEASED' && milestone.status !== 'APPROVED') {
          const res = await fetch(`/api/milestones/${milestone.id}/approve`, {
            method: 'POST',
          });
          if (!res.ok) throw new Error('Failed to approve');
        }
      }
      queryClient.invalidateQueries({ queryKey: ['/api/projects/:id', project.id] });
      toast({ title: 'Success', description: 'All documents have been approved successfully!' });
    } catch (err) {
      toast({ title: 'Error', description: 'Network error during approval', variant: 'destructive' });
    }
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
                Created by: <span className="font-semibold text-slate-800">{displayClientName || 'Trade Partner'}</span>
              </p>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!joinCode.trim()) return;
              try {
                await joinProject.mutateAsync(joinCode.trim().toUpperCase());
                toast({ title: "Joined!", description: "You have successfully joined the trade contract." });
                queryClient.invalidateQueries({ queryKey: ['/api/projects/:id', project.id] });
              } catch (err) { }
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="joinCode" className="text-slate-700 text-xs uppercase font-bold tracking-wider">Enter Join Code</Label>
                <Input
                  id="joinCode"
                  placeholder="6-CHARACTER CODE"
                  className="h-12 text-center text-lg tracking-widest font-mono bg-slate-50 border-slate-200 text-slate-900 font-bold focus:border-blue-500"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                />
              </div>
              <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all" disabled={joinProject.isPending || joinCode.length < 6}>
                {joinProject.isPending ? "Joining Workspace..." : "Accept & Join Contract"}
              </Button>
            </form>
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
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">Project: {project.title}</h1>
                <StatusBadge status={project.status} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-slate-400 font-medium text-xs">Project ID:</span>
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
            <div className="absolute top-1/2 left-0 h-[2px] bg-emerald-500 -translate-y-[28px] z-0 transition-all duration-1000" style={{ width: `${(currentStep / 3) * 100}%` }}></div>

            {[
              { label: "Access", icon: FileText, num: 1 },
              { label: "Interface", icon: ShieldCheck, num: 2 },
              { label: "Contract", icon: Truck, num: 3 },
              { label: "Upload Docs", icon: Send, num: 4 },
              { label: "Verification", icon: FileCheck, num: 5 },
              { label: "Confirmation", icon: CheckCircle2, num: 6 },
            ].map((step, idx) => {
              // Map our 4 backend steps to the 6 timeline phases
              let isCompleted = false;
              let isCurrent = false;

              if (idx < 2) {
                isCompleted = true; // access and interface are complete by default
              } else if (idx === 2) {
                // Contract status
                isCompleted = currentStep >= 1;
                isCurrent = currentStep === 0;
              } else if (idx === 3) {
                // Upload Docs status
                isCompleted = currentStep >= 2;
                isCurrent = currentStep === 1;
              } else if (idx === 4) {
                // Verification status
                isCompleted = currentStep >= 3;
                isCurrent = currentStep === 2;
              } else if (idx === 5) {
                // Confirmation status
                isCompleted = currentStep === 3;
                isCurrent = currentStep === 3;
              }

              const StepIcon = step.icon;
              return (
                <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                    isCompleted ? "bg-emerald-500 text-white shadow-sm" :
                    isCurrent ? "bg-blue-600 text-white shadow-md ring-4 ring-blue-100" :
                    "bg-slate-100 text-slate-400 border border-slate-200"
                  }`}>
                    {isCompleted ? <Check className="w-4 h-4 text-white" /> : <span className="text-xs">{step.num}</span>}
                  </div>
                  <span className={`text-[11px] font-semibold tracking-wide transition-all ${
                    isCurrent ? "text-blue-600 font-bold" : 
                    isCompleted ? "text-emerald-600" : 
                    "text-slate-400"
                  }`}>{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Action Center CTA Banner (Clean Sapphire Blue Alert at the top of the workflow page) */}
      {m && (
        <div className="p-6 rounded-xl border border-blue-100 bg-blue-50/60 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-blue-500 uppercase tracking-widest font-bold">Action Required</p>
              <h4 className="text-sm font-bold text-blue-900 mt-0.5">
                {currentStep === 0 ? "Awaiting Partner to Join Contract" : 
                 currentStep === 1 ? (isTalent ? "Provide Cargo Shipping Documentation" : "Awaiting Seller Document Uploads") : 
                 currentStep === 2 ? (isClient ? (!m.importerSubmissionUrl ? "Upload Bill of Entry Document" : "Audit Documentation Checklist & Verify") : "Awaiting Importer Document Verification") : 
                 "Trade Documents Approved & Completed"}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {currentStep === 0 && (
                  "Please share the project code with your trade partner so they can join this contract workspace."
                )}
                {currentStep === 1 && (
                  isClient ? "Waiting for the Exporter (Seller) to upload the required cargo documents." :
                  isTalent ? "You are the Exporter. Please upload your shipping documents to submit for verification." :
                  "Waiting for the Exporter (Seller) to upload cargo documents."
                )}
                {currentStep === 2 && (
                  isClient ? (
                    !m.importerSubmissionUrl
                      ? "You are the Importer. Please upload your Bill of Entry (customs declaration) document to proceed."
                      : "You are the Importer. All cargo and import documents have been successfully uploaded."
                  ) :
                  isTalent ? "You are the Exporter. Waiting for the Importer to upload the Bill of Entry." :
                  "Awaiting Importer (Buyer) customs declaration upload."
                )}
                {currentStep === 3 && "This contract has been fully verified and completed."}
              </p>
            </div>
          </div>
          <div className="w-full md:w-auto flex justify-end">
            {/* Importer Verifies Shipping Documents */}
            {isClient && currentStep === 2 && (
              <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto">
                {beMilestone && !beMilestone.importerSubmissionUrl && (
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-lg shadow-sm transition-all w-full md:w-auto text-xs tracking-wide animate-pulse" onClick={() => openImporterDialog(beMilestone.id)}>
                    <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload Bill of Entry
                  </Button>
                )}
              </div>
            )}

            {/* Status indicators */}
            {isTalent && currentStep === 0 && (
              <span className="text-xs text-slate-500 bg-slate-100 border border-slate-200 px-4 py-2.5 rounded-lg font-semibold">Awaiting Partner to Join</span>
            )}
            {isTalent && currentStep === 2 && (
              <span className="text-xs text-slate-500 bg-slate-100 border border-slate-200 px-4 py-2.5 rounded-lg font-semibold">
                {!m.importerSubmissionUrl ? "Awaiting Importer Bill of Entry" : "Documents Completed"}
              </span>
            )}
            {currentStep === 3 && (
              <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-lg font-bold flex items-center gap-1 shadow-sm">
                ✓ Documents Approved & Verified
              </span>
            )}
          </div>
        </div>
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
                                <a href={invoiceMilestone.submissionUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline">
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
                              <a href={invoiceMilestone.submissionUrl} target="_blank" rel="noopener noreferrer">
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
                              <a href={invoiceMilestone.submissionUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 hover:underline font-bold bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                                View File <ExternalLink className="w-3 h-3" />
                              </a>
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

                      {bolMilestone && (
                        <tr className="hover:bg-slate-50/40 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-900">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                BL
                              </div>
                              {bolMilestone.submissionUrl ? (
                                <a href={bolMilestone.submissionUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline">
                                  Bill of Lading (BoL) / Shipping Receipt
                                </a>
                              ) : (
                                <span>Bill of Lading (BoL) / Shipping Receipt</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-xs font-semibold">Exporter ({displayTalentName})</td>
                          <td className="px-6 py-4">
                            {bolMilestone.submissionUrl ? (
                              <a href={bolMilestone.submissionUrl} target="_blank" rel="noopener noreferrer">
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
                            {bolMilestone.submissionUrl ? (
                              <a href={bolMilestone.submissionUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 hover:underline font-bold bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                                View File <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : isTalent && currentStep === 1 ? (
                              <Button variant="outline" className="text-xs border-blue-200 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg h-auto" onClick={() => openSubmitDialog(bolMilestone.id)}>
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
                                <a href={qcMilestone.submissionUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline">
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
                              <a href={qcMilestone.submissionUrl} target="_blank" rel="noopener noreferrer">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-colors">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                  ✓ Certified
                                </span>
                              </a>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                                ⏳ Pending Upload
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {qcMilestone.submissionUrl ? (
                              <a href={qcMilestone.submissionUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 hover:underline font-bold bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                                View File <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : isTalent && currentStep === 1 ? (
                              <Button variant="outline" className="text-xs border-blue-200 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg h-auto" onClick={() => openSubmitDialog(qcMilestone.id)}>
                                <Upload className="w-3 h-3 mr-1" /> Upload
                              </Button>
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
                                <a href={beMilestone.importerSubmissionUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline">
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
                              <a href={beMilestone.importerSubmissionUrl} target="_blank" rel="noopener noreferrer">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-colors">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                  ✓ Uploaded
                                </span>
                              </a>
                            ) : allExporterSubmitted ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                ⏳ Pending Upload
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-550/10 text-amber-600 border border-amber-100 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                ⏳ Awaiting Exporter Docs
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right font-medium">
                            {beMilestone.importerSubmissionUrl ? (
                              <a href={beMilestone.importerSubmissionUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 hover:underline font-bold bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                                View File <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : isClient && currentStep === 2 ? (
                              <Button variant="outline" className="text-xs border-blue-200 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg h-auto" onClick={() => openImporterDialog(beMilestone.id)}>
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

    </div>
  );
}
