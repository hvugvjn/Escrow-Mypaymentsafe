import { useState } from "react";
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
import { Lock, FileCheck, AlertCircle, Calendar, DollarSign, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

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

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading project details...</div>;
  if (!data || !data.project) return <div className="p-8 text-center text-destructive">Project not found.</div>;

  const { project, milestones, escrow } = data;
  const isBuyer = user?.role === 'BUYER';
  const isFreelancer = user?.role === 'FREELANCER';

  const formatMoney = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const handleFund = () => {
    fundProject.mutate(project.id);
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

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border/50 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-display font-bold">{project.title}</h1>
            <StatusBadge status={project.status} />
          </div>
          <p className="text-muted-foreground">Code: <span className="font-mono bg-muted px-2 py-0.5 rounded">{project.projectCode}</span></p>
        </div>
        
        {isBuyer && project.status === 'WAITING_FOR_FUNDING' && (
          <Button onClick={handleFund} disabled={fundProject.isPending} size="lg" className="hover-elevate bg-primary text-white shadow-lg shadow-primary/20">
            <Lock className="w-4 h-4 mr-2" />
            {fundProject.isPending ? "Securing Funds..." : "Fund Escrow"}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">{project.description}</p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-2xl font-display font-bold">Milestones</h2>
            <div className="space-y-4">
              {milestones.map((m, idx) => (
                <Card key={m.id} className="overflow-hidden hover-elevate transition-shadow hover:border-primary/20">
                  <div className="bg-muted/30 px-6 py-3 border-b flex justify-between items-center">
                    <span className="font-semibold font-display text-sm uppercase tracking-wider text-muted-foreground">Milestone {idx + 1}</span>
                    <StatusBadge status={m.status} />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <h3 className="font-bold text-lg">{m.title}</h3>
                        <p className="text-sm text-muted-foreground">{m.description}</p>
                        
                        <div className="flex gap-4 pt-2 text-sm text-muted-foreground font-medium">
                          <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4"/> {format(new Date(m.deadline), 'MMM d, yyyy')}</div>
                          <div className="flex items-center gap-1.5 text-foreground"><DollarSign className="w-4 h-4 text-emerald-500"/> {formatMoney(m.amount)}</div>
                        </div>

                        {m.submissionUrl && (
                          <div className="pt-4 mt-4 border-t border-border/50">
                            <p className="text-sm font-medium mb-1">Submitted Work:</p>
                            <a href={m.submissionUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                              <FileCheck className="w-4 h-4" /> View Delivery
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 min-w-[140px] justify-center">
                        {isFreelancer && (m.status === 'PENDING' || m.status === 'REVISION_REQUESTED') && project.status === 'ACTIVE' && (
                          <Dialog open={isSubmitOpen && selectedMilestoneId === m.id} onOpenChange={(open) => {
                            setIsSubmitOpen(open);
                            if (open) setSelectedMilestoneId(m.id);
                          }}>
                            <DialogTrigger asChild>
                              <Button className="w-full">Submit Work</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Submit Milestone Delivery</DialogTitle>
                                <DialogDescription>Provide a link to your completed work.</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label>Delivery URL (Drive, Figma, GitHub, etc)</Label>
                                  <Input value={submitUrl} onChange={e => setSubmitUrl(e.target.value)} placeholder="https://" />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button onClick={handleSubmitWork} disabled={!submitUrl || submitMilestone.isPending}>
                                  {submitMilestone.isPending ? "Submitting..." : "Submit for Approval"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}

                        {isBuyer && m.status === 'SUBMITTED' && (
                          <>
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => approveMilestone.mutate(m.id)} disabled={approveMilestone.isPending}>
                              <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                            </Button>
                            <Button variant="outline" className="w-full" onClick={() => requestRevision.mutate(m.id)} disabled={requestRevision.isPending}>
                              Request Revision
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar / Escrow Info */}
        <div className="space-y-6">
          <Card className="border-primary/20 shadow-md">
            <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
              <CardTitle className="flex items-center gap-2 text-primary">
                <Lock className="w-5 h-5" /> Escrow Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {escrow ? (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Funded</p>
                    <p className="text-3xl font-display font-bold text-foreground">{formatMoney(escrow.totalAmount)}</p>
                    {escrow.funded ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded mt-2">
                        <CheckCircle2 className="w-3 h-3" /> Secured
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded mt-2">
                        <AlertCircle className="w-3 h-3" /> Awaiting Deposit
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2 pt-4 border-t border-border/50">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Released</span>
                      <span className="font-medium text-emerald-600">{formatMoney(escrow.releasedAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Remaining in Escrow</span>
                      <span className="font-medium">{formatMoney(escrow.remainingAmount)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Escrow not initialized yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
