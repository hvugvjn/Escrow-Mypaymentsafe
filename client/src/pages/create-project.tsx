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
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2, ShieldCheck, Anchor, Truck, ArrowRight } from "lucide-react";
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

  const [tradeType, setTradeType] = useState<"import" | "export" | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [expiresAt, setExpiresAt] = useState<Date>(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
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
      toast({
        title: "Validation Error",
        description: "Please fill out all contract fields and milestone details.",
        variant: "destructive"
      });
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

      // 1. Create Project (pass tradeType to routes)
      const project = await createProject.mutateAsync({
        title,
        description,
        currency,
        expiresAt,
        freelancerId: preSelectedFreelancerId || undefined,
        ...(documentUrl && { documentUrl }),
        tradeType,
      } as any);

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

  // Step 1: Select Import or Export
  if (!tradeType) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 py-8 animate-in fade-in duration-300">
        <div className="text-center">
          <h1 className="text-3xl font-display font-bold tracking-tight text-white mb-2">New Escrow Transaction</h1>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            Choose your role in this trade contract. PAX locks payment inside regulated escrow and structures the inspection milestones.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto pt-4">
          {/* Import Card */}
          <div 
            onClick={() => {
              setTradeType("import");
              setTitle("Import Contract");
              setMilestones([
                {
                  title: "Advance Sourcing Deposit",
                  description: "Pre-production deposit to secure raw materials and trigger manufacturing (30% of contract value recommended).",
                  amountInput: "",
                  deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                },
                {
                  title: "Cargo Port Dispatch Release",
                  description: "Disburses upon loading at port. Exporter must upload Bill of Lading (BoL) and pre-shipment Quality inspection (70% value recommended).",
                  amountInput: "",
                  deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
                }
              ]);
            }}
            className="group relative flex flex-col p-8 rounded-2xl border border-white/10 bg-[#050c1b]/60 hover:bg-[#071128] hover:border-blue-500/40 cursor-pointer transition-all duration-200 shadow-xl"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
              <Anchor className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">Import Transaction</h3>
            <p className="text-sm text-white/50 leading-relaxed mb-6">
              You are the <strong>Buyer / Importer</strong> securing goods or cargo from a vendor. Payouts release only after custom clearance, weights check, or delivery inspection.
            </p>
            <div className="mt-auto text-xs font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              Select Import <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Export Card */}
          <div 
            onClick={() => {
              setTradeType("export");
              setTitle("Export Contract");
              setMilestones([
                {
                  title: "Escrow Payment Security Lock",
                  description: "Confirms Importer has deposited 100% of transaction value in secure escrow vault before Exporter ships cargo.",
                  amountInput: "",
                  deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                },
                {
                  title: "Customs Entry & Delivery Release",
                  description: "Final release upon arrival. Buyer/Seller verifies customs Bill of Entry and warehouse arrival report.",
                  amountInput: "",
                  deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                }
              ]);
            }}
            className="group relative flex flex-col p-8 rounded-2xl border border-white/10 bg-[#050c1b]/60 hover:bg-[#071128] hover:border-emerald-500/40 cursor-pointer transition-all duration-200 shadow-xl"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
              <Truck className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">Export Transaction</h3>
            <p className="text-sm text-white/50 leading-relaxed mb-6">
              You are the <strong>Seller / Exporter</strong> shipping raw materials or goods. Secures buyer's funds inside the escrow vault before you load shipping cargo.
            </p>
            <div className="mt-auto text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              Select Export <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Set milestones and details
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
            Create {tradeType === "import" ? "Import" : "Export"} Escrow
          </h1>
          <p className="text-muted-foreground text-sm">Fill in contract details and configure verification stages.</p>
        </div>
        <Button variant="outline" onClick={() => setTradeType(null)} className="text-xs">
          Change Trade Direction
        </Button>
      </div>

      {preSelectedFreelancer && (
        <Card className="bg-blue-50/50 border-blue-200 shadow-sm border-dashed">
          <CardContent className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-900">Assigning to Partner</p>
                <p className="text-xs text-blue-700/70 font-medium">
                  {preSelectedFreelancer.firstName || preSelectedFreelancer.companyName || preSelectedFreelancer.email}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-white border-blue-200 text-blue-700">PRE-SELECTED</Badge>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card>
          <CardHeader>
            <CardTitle>Trade Contract Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Contract Title</Label>
              <Input 
                required 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder={tradeType === "import" ? "e.g. Copper Import - Batch A" : "e.g. Steel Pipe Export - Delivery 1"} 
              />
            </div>
            <div className="space-y-2">
              <Label>Contract Terms & Specifications</Label>
              <Textarea 
                required 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="Describe the specs, quality criteria, logistics freights, and weight inspection terms" 
                rows={4} 
              />
            </div>
            <div className="space-y-2">
              <Label>Contract Currency</Label>
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
              <p className="text-xs text-muted-foreground">All milestone release amounts will use this currency.</p>
            </div>
            <div className="space-y-2 flex flex-col">
              <Label>Contract Expiration Date</Label>
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
              <Label>Bill of Lading / Trade Document (Optional)</Label>
              <Input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  setDocumentFile(e.target.files[0]);
                }
              }} />
            </div>
          </CardContent>
        </Card>

        {/* Milestone Selection block */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display font-bold text-white">Trade Verification Stages</h2>
            <Button type="button" variant="outline" onClick={handleAddMilestone} className="hover-elevate">
              <Plus className="w-4 h-4 mr-2" /> Add Stage
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
                    <Label>Trade Stage Title</Label>
                    <Input 
                      required 
                      value={milestone.title} 
                      onChange={e => {
                        const newM = [...milestones];
                        newM[index].title = e.target.value;
                        setMilestones(newM);
                      }} 
                      placeholder={tradeType === "import" ? "e.g. Loading at Origin Port" : "e.g. Dispatch & Shipping Documents"} 
                    />
                  </div>
                  <div className="space-y-2 flex flex-col">
                    <Label>Target Date / Deadline</Label>
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
                    <Label>Gate Release Requirements / Inspection terms</Label>
                    <Textarea 
                      required 
                      value={milestone.description} 
                      onChange={e => {
                        const newM = [...milestones];
                        newM[index].description = e.target.value;
                        setMilestones(newM);
                      }} 
                      placeholder="e.g. Releases when customs entry passes or BoL is loaded"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Stage Release Amount ({currency})</Label>
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
          <Button type="submit" size="lg" className="w-full px-8 hover-elevate bg-blue-600 hover:bg-blue-700 text-white font-bold" disabled={createProject.isPending || createMilestone.isPending || isUploading}>
            {createProject.isPending || isUploading ? "Creating Contract..." : "Create Escrow Contract"}
          </Button>
        </div>
      </form>
    </div>
  );
}
