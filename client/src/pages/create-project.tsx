import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useCreateProject } from "@/hooks/use-projects";
import { useCreateMilestone } from "@/hooks/use-milestones";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2, Crown, ShieldCheck, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { CURRENCIES, getCurrencySymbol } from "@/lib/currencies";

export default function CreateProject() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const preSelectedFreelancerId = searchParams.get("freelancerId");

  const createProject = useCreateProject();
  const createMilestone = useCreateMilestone();

  const { data: preSelectedFreelancer } = useQuery<any>({
    queryKey: [`/api/users/${preSelectedFreelancerId}`],
    enabled: !!preSelectedFreelancerId,
    queryFn: async () => {
      const res = await fetch(`/api/users/${preSelectedFreelancerId}`);
      if (!res.ok) return null;
      return res.json();
    }
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [expiresAt, setExpiresAt] = useState<Date>(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const [paymentModel, setPaymentModel] = useState<"standard" | "delivery">("standard");
  const [mouAgreed, setMouAgreed] = useState(false);
  const { toast } = useToast();
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [milestones, setMilestones] = useState([{
    title: "",
    description: "",
    amountInput: "",
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
  }]);

  const handleAddMilestone = () => {
    setMilestones([...milestones, {
      title: "",
      description: "",
      amountInput: "",
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    }]);
  };

  const handleRemoveMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || milestones.some(m => !m.title || !m.amountInput || !m.deadline)) {
      return;
    }

    try {
      let documentUrl = null;
      if (documentFile) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("document", documentFile);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        setIsUploading(false);
        if (res.ok) {
          const data = await res.json();
          documentUrl = data.url;
        }
      }

      // 1. Create Project
      const project = await createProject.mutateAsync({
        title,
        description,
        currency,
        expiresAt,
        freelancerId: preSelectedFreelancerId || undefined,
        ...(documentUrl && { documentUrl }),
      });

      // 2. Create Milestones sequentially
      for (const m of milestones) {
        await createMilestone.mutateAsync({
          projectId: project.id,
          data: {
            title: m.title,
            description: m.description,
            amount: Math.round(parseFloat(m.amountInput) * 100), // Convert to cents
            deadline: m.deadline,
            projectId: project.id
          }
        });
      }

      setLocation(`/projects/${project.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">Create New Project</h1>
        <p className="text-muted-foreground">Select your escrow model and set up your project.</p>
      </div>

      {preSelectedFreelancer && (
        <Card className="bg-blue-50/50 border-blue-200 shadow-sm border-dashed">
          <CardContent className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-900">Assigning to Talent</p>
                <p className="text-xs text-blue-700/70 font-medium">
                  {preSelectedFreelancer.firstName || preSelectedFreelancer.companyName || preSelectedFreelancer.email}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-white border-blue-200 text-blue-700">PRE-SELECTED</Badge>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-display font-bold mb-2">1. Choose Payment & Escrow Model</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Standard Mode */}
          <Label 
              htmlFor="model-standard" 
              className={cn(
                "relative flex flex-col p-6 rounded-2xl border-2 cursor-pointer transition-all",
                paymentModel === "standard" ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/50 bg-card"
              )}
              onClick={() => setPaymentModel("standard")}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all", paymentModel === "standard" ? "border-primary" : "border-muted")}>
                {paymentModel === "standard" && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-1">Standard Escrow</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Fund the project upfront into a secure PAX vault. Escrow funds are only released to the talent when milestones are fully approved.
            </p>
          </Label>

          {/* Pay on Delivery Mode */}
          <Label 
              htmlFor="model-delivery" 
              className={cn(
                "relative flex flex-col p-6 rounded-2xl border-2 cursor-pointer transition-all",
                paymentModel === "delivery" ? "border-amber-500 bg-amber-500/5 shadow-md shadow-amber-500/10" : "border-border hover:border-amber-500/30 bg-card"
              )}
              onClick={() => setPaymentModel("delivery")}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                <Crown className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all", paymentModel === "delivery" ? "border-amber-500" : "border-muted")}>
                {paymentModel === "delivery" && <div className="w-2.5 h-2.5 bg-amber-500 rounded-full" />}
              </div>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg text-foreground">Pay on Delivery</h3>
              <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                VIP
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sign an MOU. PAX manages execution and holds deliverables in our secure Digital Vault. You pay absolutely zero upfront.
            </p>
          </Label>
        </div>
      </div>

      <div className="my-8 h-px bg-border w-full" />

      <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {paymentModel === "standard" ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Project Title</Label>
                  <Input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Website Redesign" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea required value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the overall scope of work" rows={4} />
                </div>
                <div className="space-y-2">
                  <Label>Project Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {CURRENCIES.map(c => (
                        <SelectItem key={c.code} value={c.code}>
                          <span className="flex items-center gap-2">
                            <span>{c.flag}</span>
                            <span className="font-mono font-semibold">{c.code}</span>
                            <span className="text-muted-foreground">– {c.name}</span>
                            <span className="ml-auto text-muted-foreground font-mono">{c.symbol}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">All milestone amounts will use this currency.</p>
                </div>
                <div className="space-y-2 flex flex-col">
                  <Label>Invite Expires At</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !expiresAt && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {expiresAt ? format(expiresAt, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={expiresAt} onSelect={(d) => d && setExpiresAt(d)} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2 flex flex-col">
                  <Label>Project Document (Optional)</Label>
                  <Input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setDocumentFile(e.target.files[0]);
                    }
                  }} />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-display font-bold">Milestones</h2>
                <Button type="button" variant="outline" onClick={handleAddMilestone} className="hover-elevate">
                  <Plus className="w-4 h-4 mr-2" /> Add Milestone
                </Button>
              </div>

              {milestones.map((milestone, index) => (
                <Card key={index} className="relative overflow-visible border-border/60 shadow-sm">
                  {milestones.length > 1 && (
                    <Button type="button" variant="destructive" size="icon" className="absolute -top-3 -right-3 h-8 w-8 rounded-full shadow-md z-10" onClick={() => handleRemoveMilestone(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Milestone Title</Label>
                        <Input required value={milestone.title} onChange={e => {
                          const newM = [...milestones];
                          newM[index].title = e.target.value;
                          setMilestones(newM);
                        }} placeholder="e.g. Initial Wireframes" />
                      </div>
                      <div className="space-y-2 flex flex-col">
                        <Label>Deadline</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !milestone.deadline && "text-muted-foreground")}>
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {milestone.deadline ? format(milestone.deadline, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={milestone.deadline} onSelect={(d) => {
                              if (d) {
                                const newM = [...milestones];
                                newM[index].deadline = d;
                                setMilestones(newM);
                              }
                            }} initialFocus />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Description & Requirements</Label>
                        <Textarea required value={milestone.description} onChange={e => {
                          const newM = [...milestones];
                          newM[index].description = e.target.value;
                          setMilestones(newM);
                        }} />
                      </div>
                      <div className="space-y-2">
                        <Label>Amount ({currency})</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground text-sm font-medium">{getCurrencySymbol(currency)}</span>
                          <Input type="number" step="0.01" min="0.01" required className="pl-8" value={milestone.amountInput} onChange={e => {
                            const newM = [...milestones];
                            newM[index].amountInput = e.target.value;
                            setMilestones(newM);
                          }} placeholder="0.00" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" size="lg" className="w-full px-8 hover-elevate" disabled={createProject.isPending || createMilestone.isPending || isUploading}>
                {createProject.isPending || isUploading ? "Creating..." : "Create Project & Escrow"}
              </Button>
            </div>
          </>
        ) : (
          <Card className="border-amber-500/30 shadow-md">
            <CardHeader className="bg-amber-500/5 border-b border-amber-500/10">
                <div className="flex items-center gap-2">
                    <Crown className="w-6 h-6 text-amber-500"/>
                    <CardTitle className="text-amber-700 dark:text-amber-400 font-bold">VIP Pay-on-Delivery MOU</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-8">
                <div className="space-y-2 max-w-xl">
                  <Label>Project Name (For the MOU Contract)</Label>
                  <Input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Website Redesign" className="border-amber-500/20 focus-visible:ring-amber-500/30" />
                </div>
                
                <div className="prose dark:prose-invert text-sm text-foreground leading-relaxed bg-white/5 p-6 md:p-8 rounded-xl border border-white/10">
                    <p className="text-xl font-bold text-foreground mb-4 font-display">Memorandum of Understanding (MOU)</p>
                    <p>By proceeding with the VIP Pay-on-Delivery model, you ("The Client") agree to the following legally binding terms:</p>
                    <ul className="list-disc pl-5 space-y-4 mt-6">
                        <li><strong>Project Management:</strong> PAX will fully manage the project execution and host all files on our secure staging servers.</li>
                        <li><strong>Testing & Review:</strong> You will be granted full access to review, test, and approve the completed project on our staging environment before paying any amount.</li>
                        <li className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-900 dark:text-amber-100">
                          <strong>Escrow Requirement:</strong> To gain access to the final source code, administrator credentials, and file transfers, you must pay the full amount of the project into the PAX escrow <strong>only after you are satisfied with the demo</strong>.
                        </li>
                        <li><strong>Release of Assets:</strong> Only after the full escrow payment is successfully deposited and verified will PAX release the final project assets to you.</li>
                    </ul>
                </div>

                <div className="bg-amber-500/10 p-5 rounded-xl border border-amber-500/30 flex items-start gap-4">
                    <Checkbox id="mou-agree" checked={mouAgreed} onCheckedChange={(c) => setMouAgreed(Boolean(c))} className="mt-1 border-amber-500/50 data-[state=checked]:bg-amber-500 data-[state=checked]:text-white shadow-sm" />
                    <label htmlFor="mou-agree" className="text-sm font-medium leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                        I have read and legally bind myself to this Memorandum of Understanding.<br />
                        <span className="text-muted-foreground font-normal">I understand that I am not required to pay upfront, but I must pay the full project amount later to definitively take ownership of the final assets.</span>
                    </label>
                </div>

                <div className="flex justify-end pt-6 border-t border-border mt-8">
                  <Button 
                      type="button" 
                      onClick={(e) => {
                          e.preventDefault();
                          if (!title) {
                            toast({
                              title: "Missing Information",
                              description: "Please provide a project name for the MOU.",
                              variant: "destructive"
                            });
                            return;
                          }
                          toast({ 
                              title: "VIP Enrollment Approved", 
                              description: "Redirecting to checkout for ₹2000 VIP Access fee..." 
                          });
                      }}
                      size="lg" 
                      className="w-full md:w-auto px-10 py-6 text-base bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-xl shadow-amber-500/20 font-bold"
                      disabled={!mouAgreed}
                  >
                      Complete MOU & Pay ₹2000
                  </Button>
                </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}
