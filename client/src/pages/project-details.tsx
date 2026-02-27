import { useState, useEffect, useRef } from "react";
import { useParams } from "wouter";
import { useProject, useFundProject } from "@/hooks/use-projects";
import { useSubmitMilestone, useApproveMilestone, useRequestRevision } from "@/hooks/use-milestones";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, FileCheck, AlertCircle, Calendar, DollarSign, CheckCircle2, FileText, CreditCard, Share2, Check, User, Users, Clock, AlertTriangle, Copy, ExternalLink, Flag, Send, MessageCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { format, isPast } from "date-fns";

export default function ProjectDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data, isLoading } = useProject(id!);

  const fundProject = useFundProject();
  const submitMilestone = useSubmitMilestone();
  const approveMilestone = useApproveMilestone();
  const requestRevision = useRequestRevision();

  const [submitUrl, setSubmitUrl] = useState("");
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const [receipt, setReceipt] = useState<{ type: string; amount: number; date?: string; milestoneTitle?: string } | null>(null);
  const { toast } = useToast();

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast({ title: "Link Copied!", description: "Project URL has been copied to clipboard." });
    }).catch(() => {
      toast({ title: "Copied!", description: `Share this link: ${url}`, variant: "default" });
    });
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
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading project details...</div>;
  if (!data || !data.project) return <div className="p-8 text-center text-destructive">Project not found.</div>;

  const { project, milestones, escrow, buyerName, freelancerName } = data;
  const isBuyer = user?.role === 'BUYER';
  const isFreelancer = user?.role === 'FREELANCER';

  const formatMoney = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const handleDummyPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);
    setTimeout(() => {
      fundProject.mutate(project.id, {
        onSuccess: () => {
          setIsProcessingPayment(false);
          setIsPaymentOpen(false);
        },
        onError: () => {
          setIsProcessingPayment(false);
        }
      });
    }, 1500);
  };

  const handleSubmitWork = () => {
    if (selectedMilestoneId && submitUrl) {
      submitMilestone.mutate({ id: selectedMilestoneId, submissionUrl: submitUrl }, {
        onSuccess: () => {
          setIsSubmitOpen(false);
          setSubmitUrl("");
        }
      });
    }
  };

  // Determine active flow step (0 to 5)
  let currentStep = 0;
  if (project.status === 'WAITING_FOR_FUNDING') currentStep = 1;
  else if (project.status === 'ACTIVE') currentStep = 3;
  else if (project.status === 'UNDER_REVIEW') currentStep = 4;
  else if (project.status === 'COMPLETED') currentStep = 5;

  const flowSteps = [
    { label: "Created", num: 1 },
    { label: "Assigned", num: 2 },
    { label: "Funded", num: 3 },
    { label: "In Dev", num: 4 },
    { label: "UAT", num: 5 },
    { label: "Closed", num: 6 },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 w-full animate-in fade-in duration-500">

      {/* Top Header Section */}
      <Card className="border-border/50 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-background border-b border-border/50">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-display font-bold tracking-tight">{project.title}</h1>
              <StatusBadge status={project.status} />
            </div>
            <p className="text-muted-foreground font-medium text-sm">Project ID: <span className="font-mono bg-muted px-2 py-0.5 rounded">{project.projectCode}</span></p>
          </div>
          <div className="flex items-center gap-3">
            {isBuyer && project.status === 'WAITING_FOR_FUNDING' && (
              <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                <DialogTrigger asChild>
                  <Button className="hover-elevate bg-primary text-white shadow-lg shadow-primary/20">
                    <Lock className="w-4 h-4 mr-2" />
                    Fund Escrow
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary" /> Secure Deposit</DialogTitle>
                    <DialogDescription>
                      Enter your payment details to fund the escrow. This is a dummy payment gateway before Stripe integration.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleDummyPayment} className="space-y-4 py-4">
                    <div className="p-4 bg-muted/50 rounded-lg flex justify-between items-center mb-4 border border-border/50">
                      <span className="font-semibold text-muted-foreground">Total to Pay</span>
                      <span className="text-xl font-bold">{formatMoney(escrow?.totalAmount || 0)}</span>
                    </div>
                    <div className="space-y-2">
                      <Label>Cardholder Name</Label>
                      <Input required placeholder="Jane Doe" />
                    </div>
                    <div className="space-y-2">
                      <Label>Card Number</Label>
                      <Input required placeholder="0000 0000 0000 0000" maxLength={19} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Expiry Date</Label>
                        <Input required placeholder="MM/YY" maxLength={5} />
                      </div>
                      <div className="space-y-2">
                        <Label>CVV</Label>
                        <Input required placeholder="123" maxLength={4} type="password" />
                      </div>
                    </div>
                    <DialogFooter className="pt-4">
                      <Button type="submit" className="w-full bg-primary" disabled={isProcessingPayment}>
                        {isProcessingPayment ? "Processing Payment..." : `Pay Now`}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
            <Button variant="outline" onClick={handleShare} className="gap-2">
              <Share2 className="w-4 h-4" /> Share
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="More options">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleShare}>
                  <Copy className="w-4 h-4 mr-2" /> Copy Project Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open(`/projects/${project.id}`, '_blank')}>
                  <ExternalLink className="w-4 h-4 mr-2" /> Open in New Tab
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-muted-foreground" disabled>
                  <Flag className="w-4 h-4 mr-2" /> Report Issue
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Metadata Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 md:p-8 bg-muted/5">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Company</p>
            <div className="flex items-center gap-2 font-medium">
              <Users className="w-4 h-4 text-muted-foreground" /> {buyerName}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Freelancer</p>
            <div className="flex items-center gap-2 font-medium">
              <User className="w-4 h-4 text-muted-foreground" /> {freelancerName}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Overall Due Date</p>
            <div className="flex items-center gap-2 font-medium">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              {project.expiresAt ? format(new Date(project.expiresAt), 'MMM d, yyyy') : 'TBD'}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Priority</p>
            <div className="flex items-center gap-2 font-medium text-amber-600">
              High
            </div>
          </div>
        </div>
      </Card>

      {/* Visual Workflow Stages */}
      <Card className="border-border/50 shadow-sm p-8">
        <h3 className="font-display font-semibold text-lg mb-8">Workflow Stages</h3>
        <div className="flex items-center justify-between relative max-w-4xl mx-auto">
          {/* Connector Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted -translate-y-1/2 z-0 rounded-full"></div>
          <div className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 z-0 rounded-full transition-all duration-1000" style={{ width: `${(currentStep / 5) * 100}%` }}></div>

          {flowSteps.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;
            return (
              <div key={idx} className="relative z-10 flex flex-col items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-sm transition-all shadow-md ${isCompleted ? "bg-emerald-500 text-white" :
                  isCurrent ? "bg-primary text-primary-foreground ring-4 ring-primary/20" :
                    "bg-muted text-muted-foreground border-2 border-border/50"
                  }`}>
                  {isCompleted ? <Check className="w-6 h-6" /> : step.num}
                </div>
                <span className={`text-sm font-medium ${isCurrent ? "text-primary" : "text-muted-foreground"}`}>{step.label}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Tabbed Interface */}
      <Tabs defaultValue="milestones" className="w-full">
        <TabsList className="w-full justify-start h-auto p-1 bg-transparent border-b rounded-none gap-6 mb-8">
          <TabsTrigger value="details" className="text-base rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1">Details</TabsTrigger>
          <TabsTrigger value="milestones" className="text-base rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1">Milestones & Tracking</TabsTrigger>
          <TabsTrigger value="activity" className="text-base rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1">Activity</TabsTrigger>
          <TabsTrigger value="payments" className="text-base rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1">Payments</TabsTrigger>
          <TabsTrigger value="chat" className="text-base rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1 flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4" /> Chat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="m-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="border-border/50">
            <CardContent className="p-8 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Project Description</h3>
                <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed bg-muted/20 p-6 rounded-xl border border-border/50">{project.description}</p>
              </div>

              {project.documentUrl && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Master Documents</h3>
                  <a href={project.documentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 p-4 border border-border/50 rounded-xl hover:bg-muted/50 transition-colors w-full md:w-auto">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">Project_Requirements.pdf</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Click to view or download master agreement</p>
                    </div>
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones" className="m-0 animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
          {milestones.length === 0 && <p className="text-center text-muted-foreground py-8">No milestones defined.</p>}

          {milestones.map((m, idx) => {
            const isOverdue = m.status === 'PENDING' && isPast(new Date(m.deadline));
            return (
              <Card key={m.id} className={`overflow-hidden transition-all ${isOverdue ? "border-destructive/50 shadow-destructive/10 shadow-lg" : "border-border/50 hover:border-primary/20 shadow-sm"}`}>
                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-6 justify-between items-start">

                    {/* Left Side Info */}
                    <div className="flex gap-4">
                      <div className="mt-1">
                        {m.status === 'APPROVED' ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center"><Check className="w-4 h-4" /></div>
                        ) : m.status === 'SUBMITTED' ? (
                          <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center"><Clock className="w-4 h-4" /></div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center p-1"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                          Step {idx + 1}: {m.title}
                          {m.status === 'APPROVED' && <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded font-semibold ml-2">Completed</span>}
                          {m.status === 'SUBMITTED' && <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded font-semibold ml-2">Under UAT Review</span>}
                        </h3>
                        <p className="text-muted-foreground mb-4">{m.description}</p>

                        {/* Sub-checklist / Status */}
                        <div className="flex flex-wrap gap-4 text-sm font-medium text-muted-foreground/80">
                          <div className="flex items-center gap-1.5 p-2 bg-muted/30 rounded-lg border">
                            <Calendar className="w-4 h-4" />
                            Due: <span className={isOverdue ? "text-destructive font-bold" : "text-foreground"}>{format(new Date(m.deadline), 'MMM d, yyyy')}</span>
                          </div>
                          <div className="flex items-center gap-1.5 p-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-200 dark:border-emerald-900/50">
                            <DollarSign className="w-4 h-4" /> Escrow Allocation: {formatMoney(m.amount)}
                          </div>
                        </div>

                        {/* Penalty Warning for Overdue */}
                        {isOverdue && (
                          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-sm">Penalty Warning: Late UAT Submission</p>
                              <p className="text-xs mt-0.5 opacity-90">This milestone has missed its deadline. Further delays may trigger platform dispute penalties.</p>
                            </div>
                          </div>
                        )}

                        {/* Delivery Link Display */}
                        {m.submissionUrl && (
                          <div className="mt-4 p-4 border border-border/50 rounded-xl bg-muted/10">
                            <p className="text-sm font-medium mb-2 opacity-80">Submitted Work:</p>
                            <a href={m.submissionUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary bg-primary/5 hover:bg-primary/10 transition-colors px-3 py-1.5 rounded-lg border border-primary/20 text-sm font-medium">
                              <FileCheck className="w-4 h-4" /> Open Delivery Link
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex flex-col gap-2 min-w-[160px] md:items-end w-full md:w-auto">
                      {isFreelancer && (m.status === 'PENDING' || m.status === 'REVISION_REQUESTED') && project.status === 'ACTIVE' && (
                        <Dialog open={isSubmitOpen && selectedMilestoneId === m.id} onOpenChange={(open) => {
                          setIsSubmitOpen(open);
                          if (open) setSelectedMilestoneId(m.id);
                        }}>
                          <DialogTrigger asChild>
                            <Button className="w-full shad-btn-primary shadow-lg shadow-primary/20">Submit UAT</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Submit UAT (User Acceptance Testing) Delivery</DialogTitle>
                              <DialogDescription>Provide a link to your completed work for this milestone.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>Delivery URL (Drive, Figma, GitHub, TestFlight, etc)</Label>
                                <Input value={submitUrl} onChange={e => setSubmitUrl(e.target.value)} placeholder="https://" />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button onClick={handleSubmitWork} disabled={!submitUrl || submitMilestone.isPending} className="bg-primary">
                                {submitMilestone.isPending ? "Submitting..." : "Submit for Approval"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}

                      {isBuyer && m.status === 'SUBMITTED' && (
                        <div className="space-y-2 w-full">
                          <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg" onClick={() => approveMilestone.mutate(m.id)} disabled={approveMilestone.isPending}>
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Approve & Pay
                          </Button>
                          <Button variant="outline" className="w-full border-amber-500/50 text-amber-600 hover:bg-amber-50" onClick={() => requestRevision.mutate(m.id)} disabled={requestRevision.isPending}>
                            Request Revision
                          </Button>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="activity" className="m-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="border-border/50">
            <CardHeader className="border-b">
              <CardTitle className="text-xl">Activity Feed & Comments</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Mock timeline for dashboard effect */}
              <div className="p-6 md:p-8 space-y-8">

                {/* Activity Iterations based on milestones */}
                {milestones.filter((m: any) => m.status === 'APPROVED').map((m: any, i: number) => (
                  <div key={`app-${i}`} className="flex gap-4">
                    <div className="mt-1 w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{buyerName}</span>
                        <span className="text-muted-foreground text-sm">approved UAT & released funds</span>
                      </div>
                      <div className="mt-2 p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-lg font-medium inline-block">
                        ✓ Payment of {formatMoney(m.amount)} released to {freelancerName}
                      </div>
                    </div>
                  </div>
                ))}

                {milestones.filter((m: any) => m.status === 'SUBMITTED').map((m: any, i: number) => (
                  <div key={`sub-${i}`} className="flex gap-4">
                    <div className="mt-1 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Check className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{freelancerName}</span>
                        <span className="text-muted-foreground text-sm">submitted UAT for {m.title}</span>
                      </div>
                      <p className="mt-1 text-muted-foreground bg-muted/30 p-3 rounded-lg border inline-block mt-2">All deliverables completed and ready for review.</p>
                    </div>
                  </div>
                ))}

                {/* System Notifications based on escrow */}
                {escrow?.funded && (
                  <div className="flex gap-4 relative">
                    <div className="mt-1 w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 z-10">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">System</span>
                        <span className="text-muted-foreground text-sm">secured project funding in Vault</span>
                      </div>
                      <div className="mt-2 p-3 bg-muted border rounded-lg text-sm text-muted-foreground">
                        Initial Escrow Funded with {formatMoney(escrow.totalAmount)}. Project officially ACTIVE.
                      </div>
                    </div>
                  </div>
                )}

                <div className="border-t pt-6 mt-8">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold">{user?.firstName?.[0] || '?'}</div>
                    <div className="flex-1">
                      <Input className="w-full h-12 bg-muted/50 border-input" placeholder="Add a comment or update..." />
                      <div className="flex justify-end mt-3">
                        <Button size="sm">Post Update</Button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="m-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="border-border/50">
            <CardHeader className="bg-primary/5 border-b border-primary/10 pb-6">
              <CardTitle className="flex items-center gap-2 text-primary text-xl">
                Escrow Account Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">

              {/* Summary Metrics */}
              {escrow ? (
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x border-b">
                  <div className="p-8">
                    <p className="text-muted-foreground mb-2 font-medium">Total Escrow Vaulted</p>
                    <p className="text-4xl font-display font-bold text-foreground">
                      {escrow.funded ? formatMoney(escrow.totalAmount) : "$0.00"}
                    </p>
                    {escrow.funded ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-1 rounded mt-3">
                        <CheckCircle2 className="w-3 h-3" /> SECURED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-1 rounded mt-3">
                        <AlertCircle className="w-3 h-3" /> PENDING DEPOSIT
                      </span>
                    )}
                  </div>
                  <div className="p-8">
                    <p className="text-muted-foreground mb-2 font-medium">Released to Freelancer</p>
                    <p className="text-4xl font-display font-bold text-emerald-600">{formatMoney(escrow.releasedAmount)}</p>
                  </div>
                  <div className="p-8">
                    <p className="text-muted-foreground mb-2 font-medium">Remaining Locked</p>
                    <p className="text-4xl font-display font-bold text-amber-500">{formatMoney(escrow.remainingAmount)}</p>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">Escrow not initialized</div>
              )}

              {/* Transactions Table */}
              <div className="p-8">
                <h4 className="font-semibold text-lg mb-6">Payment Transaction History</h4>
                {escrow && escrow.funded ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-muted-foreground uppercase bg-muted/50 rounded-lg">
                        <tr>
                          <th className="px-4 py-3 font-semibold rounded-l-lg">Description</th>
                          <th className="px-4 py-3 font-semibold">Amount</th>
                          <th className="px-4 py-3 font-semibold">Status</th>
                          <th className="px-4 py-3 font-semibold rounded-r-lg text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {/* Initial Funding Row */}
                        <tr className="hover:bg-muted/10 transition-colors">
                          <td className="px-4 py-4 font-medium">Initial Escrow Security Deposit</td>
                          <td className="px-4 py-4 font-bold">{formatMoney(escrow.totalAmount)}</td>
                          <td className="px-4 py-4"><span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded font-semibold">Completed</span></td>
                          <td className="px-4 py-4 text-right">
                            <Button variant="link" className="text-primary h-auto p-0" onClick={() => setReceipt({ type: 'escrow', amount: escrow.totalAmount, date: escrow.fundedAt ? new Date(escrow.fundedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) })}>
                              View Receipt
                            </Button>
                          </td>
                        </tr>
                        {/* Milestone rows */}
                        {milestones.map((m: any, idx: number) => (
                          <tr key={idx} className="hover:bg-muted/10 transition-colors opacity-80">
                            <td className="px-4 py-4">{m.title} Release</td>
                            <td className="px-4 py-4 font-medium">{formatMoney(m.amount)}</td>
                            <td className="px-4 py-4">
                              {m.status === 'APPROVED' ? (
                                <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded font-semibold">Released</span>
                              ) : m.status === 'SUBMITTED' ? (
                                <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded font-semibold">Pending UAT Approve</span>
                              ) : (
                                <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded font-semibold">Locked</span>
                              )}
                            </td>
                            <td className="px-4 py-4 text-right">
                              {m.status === 'APPROVED' ? (
                                <Button variant="link" className="text-primary h-auto p-0" onClick={() => setReceipt({ type: 'milestone', amount: m.amount, milestoneTitle: m.title, date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) })}>
                                  View Receipt
                                </Button>
                              ) : <span className="text-muted-foreground text-xs">Waiting</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-muted/30 rounded-xl border border-dashed mb-4">
                    <p className="text-muted-foreground flex items-center justify-center gap-2"><Lock className="w-4 h-4" /> No payment history yet.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Receipt Modal ─────────────────────────────────── */}
        {receipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setReceipt(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={e => e.stopPropagation()} id="receipt-print-area">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-6 text-white text-center">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <p className="text-white/80 text-sm tracking-widest uppercase font-medium">PAX Escrow</p>
                <h2 className="text-2xl font-bold mt-1">Payment Receipt</h2>
              </div>

              {/* Body */}
              <div className="px-8 py-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Receipt No.</span>
                  <span className="font-mono font-semibold text-gray-800">#{project.projectCode}-{receipt.type === 'escrow' ? '001' : receipt.milestoneTitle?.slice(0, 4).toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium text-gray-800">{receipt.date || new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Project</span>
                  <span className="font-medium text-gray-800">{project.title}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Project ID</span>
                  <span className="font-mono text-xs text-gray-600">{project.projectCode}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Buyer</span>
                  <span className="font-medium text-gray-800">{buyerName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Freelancer</span>
                  <span className="font-medium text-gray-800">{freelancerName}</span>
                </div>
                {receipt.milestoneTitle && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Milestone</span>
                    <span className="font-medium text-gray-800">{receipt.milestoneTitle}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Type</span>
                  <span className="font-medium text-gray-800">{receipt.type === 'escrow' ? 'Initial Escrow Deposit' : 'Milestone Release'}</span>
                </div>

                <div className="border-t border-dashed border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900 text-lg">Total Amount</span>
                    <span className="font-bold text-2xl text-indigo-600">{formatMoney(receipt.amount)}</span>
                  </div>
                  <div className="mt-2 flex justify-between text-sm">
                    <span className="text-gray-500">Status</span>
                    <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded font-semibold">✓ Completed</span>
                  </div>
                </div>

                <p className="text-center text-xs text-gray-400 pt-2">This is a system-generated receipt from PAX Escrow Platform.</p>
              </div>

              {/* Footer Buttons */}
              <div className="px-8 pb-6 flex gap-3">
                <Button className="flex-1 gap-2" onClick={() => { const w = window.open('', '_blank'); if (w) { w.document.write('<html><head><title>Receipt</title><style>body{font-family:sans-serif;padding:32px;max-width:480px;margin:auto}</style></head><body>' + document.getElementById('receipt-print-area')!.innerHTML + '</body></html>'); w.document.close(); w.print(); } }}>
                  🖨️ Print / Save PDF
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setReceipt(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── Chat Tab ──────────────────────────────────── */}
        <TabsContent value="chat" className="mt-0">
          <Card className="border-0 shadow-none">
            <CardHeader className="px-8 py-6 border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageCircle className="w-5 h-5 text-primary" /> Project Chat
                <span className="ml-auto text-xs font-normal text-muted-foreground">Messages refresh every 5 seconds</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Messages Area */}
              <div className="h-[420px] overflow-y-auto px-8 py-6 space-y-4 bg-muted/10">
                {chatMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <MessageCircle className="w-7 h-7 text-primary" />
                    </div>
                    <p className="text-muted-foreground font-medium">No messages yet</p>
                    <p className="text-sm text-muted-foreground">Start the conversation with your project partner!</p>
                  </div>
                ) : (
                  chatMessages.map((msg: any) => {
                    const isMe = msg.senderId === user?.id;
                    return (
                      <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${msg.senderRole === 'BUYER' ? 'bg-violet-500' : 'bg-emerald-500'
                          }`}>
                          {msg.senderName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                          <div className="flex items-center gap-2">
                            {!isMe && <span className="text-xs font-semibold text-foreground">{msg.senderName}</span>}
                            <span className="text-xs text-muted-foreground">
                              {msg.senderRole === 'BUYER' ? '🏢 Buyer' : '💼 Freelancer'}
                            </span>
                          </div>
                          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe
                            ? 'bg-primary text-primary-foreground rounded-tr-sm'
                            : 'bg-background border border-border rounded-tl-sm'
                            }`}>
                            {msg.content}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Input Area */}
              <div className="px-8 py-5 border-t bg-background">
                <div className="flex gap-3 items-center">
                  <Input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    placeholder="Type a message... (Enter to send)"
                    className="flex-1 rounded-xl"
                    disabled={isSendingMsg}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim() || isSendingMsg}
                    className="gap-2 rounded-xl px-5"
                  >
                    <Send className="w-4 h-4" /> Send
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
