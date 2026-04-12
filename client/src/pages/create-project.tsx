import { useState } from "react";
import { useLocation } from "wouter";
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
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2, Crown, ShieldCheck, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { CURRENCIES, getCurrencySymbol } from "@/lib/currencies";

export default function CreateProject() {
  const [, setLocation] = useLocation();
  const createProject = useCreateProject();
  const createMilestone = useCreateMilestone();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [expiresAt, setExpiresAt] = useState<Date>(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const [paymentModel, setPaymentModel] = useState<"standard" | "delivery">("standard");
  const isVip = false; // TODO: Implement VIP checking mechanism from auth context
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
        <p className="text-muted-foreground">Set up escrow details and milestones.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
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

        <div className="space-y-4 pt-4">
          <h2 className="text-2xl font-display font-bold">Payment & Escrow Model</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Standard Mode */}
            <Label 
                htmlFor="model-standard" 
                className={cn(
                  "relative flex flex-col p-6 rounded-2xl border-2 cursor-pointer transition-all disabled:opacity-50",
                  paymentModel === "standard" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 bg-card"
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
                Fund the project upfront into a secure PAX vault. Escrow funds are only released to the freelancer when milestones are fully approved.
              </p>
            </Label>

            {/* Pay on Delivery Mode */}
            <Label 
                htmlFor="model-delivery" 
                className={cn(
                  "relative flex flex-col p-6 rounded-2xl border-2 transition-all overflow-hidden",
                  isVip 
                     ? (paymentModel === "delivery" ? "border-primary bg-primary/5 cursor-pointer" : "border-border hover:border-primary/50 bg-card cursor-pointer")
                     : "cursor-not-allowed border-border/50 bg-muted/30 opacity-90"
                )}
                onClick={() => {
                  if (isVip) setPaymentModel("delivery");
                }}
            >
              {!isVip && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center rounded-2xl">
                  <div className="bg-background border border-amber-500/20 shadow-xl rounded-xl p-5 flex flex-col items-center text-center max-w-[85%]">
                    <Crown className="w-7 h-7 text-amber-500 mb-2" />
                    <span className="font-semibold text-sm mb-1 text-foreground">VIP Exclusive Access</span>
                    <span className="text-xs text-muted-foreground mb-4 leading-relaxed">The "Pay on Delivery" vault is reserved exclusively for VIP corporate members.</span>
                    <Button 
                        type="button" 
                        size="sm" 
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-md font-semibold" 
                        onClick={(e) => {
                           e.preventDefault();
                           toast({
                             title: "VIP Upgrade",
                             description: "Redirecting to checkout... (₹2000 Integration pending)",
                           });
                        }}
                    >
                        Upgrade Access (₹2000)
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all", paymentModel === "delivery" ? "border-primary" : "border-muted")}>
                  {paymentModel === "delivery" && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                </div>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg text-foreground">Pay on Delivery</h3>
                <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Crown className="w-3 h-3" /> VIP
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Sign a digital MOU. PAX manages execution and holds deliverables in our secure Digital Vault. You pay absolutely zero upfront.
              </p>
            </Label>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" className="w-full px-8 hover-elevate" disabled={createProject.isPending || createMilestone.isPending || isUploading}>
            {createProject.isPending || isUploading ? "Creating..." : "Create Project & Escrow"}
          </Button>
        </div>
      </form>
    </div>
  );
}
