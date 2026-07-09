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
import { format } from "date-fns";
import { CalendarIcon, Anchor, Truck, ArrowRight } from "lucide-react";
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
  const [expiresAt, setExpiresAt] = useState<Date>(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  const { toast } = useToast();
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Simplified Tracking State
  const [totalValue, setTotalValue] = useState("");
  const [requiredDocs, setRequiredDocs] = useState({
    invoice: true,
    packingList: true,
    billOfLading: true,
    inspectionCertificate: true,
    billOfEntry: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !totalValue) {
      toast({
        title: "Validation Error",
        description: "Please fill out all contract fields and enter the total trade value.",
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

      // 2. Create separate milestones for each checked document type
      const docTypes = [
        { key: 'invoice', title: 'Commercial Invoice & Packing List', description: 'Exporter Commercial Invoice & packing specification list' },
        { key: 'billOfLading', title: 'Bill of Lading (BoL) / Shipping Receipt', description: 'Carrier Bill of Lading or cargo receipt document' },
        { key: 'inspectionCertificate', title: 'Quality Certificate (SGS Inspection)', description: 'SGS or equivalent quality/quantity certification' },
        { key: 'billOfEntry', title: 'Import customs declaration (Bill of Entry)', description: 'Importer Bill of Entry customs document' },
      ];

      let createdAnyMilestone = false;
      for (const doc of docTypes) {
        if (requiredDocs[doc.key as keyof typeof requiredDocs]) {
          await createMilestone.mutateAsync({
            projectId: project.id,
            data: {
              title: doc.title,
              description: doc.description,
              amount: 0,
              deadline: expiresAt,
              projectId: project.id
            }
          });
          createdAnyMilestone = true;
        }
      }

      // If they unchecked all, create a fallback milestone
      if (!createdAnyMilestone) {
        await createMilestone.mutateAsync({
          projectId: project.id,
          data: {
            title: 'Commercial Invoice & Packing List',
            description: 'Fallback document checklist',
            amount: 0,
            deadline: expiresAt,
            projectId: project.id
          }
        });
      }

      setLocation(`/projects/${project.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  // Step 1: Select Import or Export (Light Clean design inspired by Details page)
  if (!tradeType) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 py-8 animate-in fade-in duration-300">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">New Escrow Transaction</h1>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            Choose your role in this trade contract. PAX locks payment inside regulated escrow and structures the inspection milestones.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto pt-4">
          {/* Import Card */}
          <div 
            onClick={() => {
              setTradeType("import");
              setTitle("Import Trade Escrow Agreement");
            }}
            className="group relative flex flex-col p-8 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50/50 hover:border-blue-500/40 cursor-pointer transition-all duration-200 shadow-sm"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
              <Anchor className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">Import Transaction</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              You are the <strong>Buyer / Importer</strong> securing goods or cargo from a vendor. Payouts release only after customs clearance, weights check, or delivery inspection.
            </p>
            <div className="mt-auto text-xs font-semibold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
              Select Import <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Export Card */}
          <div 
            onClick={() => {
              setTradeType("export");
              setTitle("Export Trade Escrow Agreement");
            }}
            className="group relative flex flex-col p-8 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50/50 hover:border-emerald-500/40 cursor-pointer transition-all duration-200 shadow-sm"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
              <Truck className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">Export Transaction</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              You are the <strong>Seller / Exporter</strong> shipping raw materials or goods. Secures buyer's funds inside the escrow vault before you load shipping cargo.
            </p>
            <div className="mt-auto text-xs font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
              Select Export <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Set contract details (Clean Light Theme matching Details Workspace)
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Create {tradeType === "import" ? "Import" : "Export"} Escrow
          </h1>
          <p className="text-slate-500 text-sm">Fill in contract details and configure verification gates.</p>
        </div>
        <Button variant="outline" onClick={() => setTradeType(null)} className="text-xs border-slate-200 text-slate-700 hover:bg-slate-50">
          Change Trade Direction
        </Button>
      </div>

      {preSelectedFreelancer && (
        <Card className="bg-blue-50 border-blue-200 shadow-sm border-dashed">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
              {preSelectedFreelancer.firstName?.[0] || 'U'}
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-800">Assigned Partner: {preSelectedFreelancer.firstName} {preSelectedFreelancer.lastName}</p>
              <p className="text-xs text-blue-600/80">This trade contract will be linked directly to this user.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border border-slate-100 shadow-sm bg-white rounded-xl">
          <CardHeader className="border-b border-slate-100 bg-slate-50/30 py-4 px-6">
            <CardTitle className="text-base font-semibold text-slate-800">Trade Contract Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-slate-700 text-xs font-bold uppercase tracking-wider">Contract Title</Label>
              <Input 
                id="title" 
                required 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="e.g. Bulk Wheat Shipment Mumbai to Dubai" 
                className="bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-700 text-xs font-bold uppercase tracking-wider">Contract Terms & Specifications</Label>
              <Textarea 
                id="description" 
                required 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="Describe the specs, quality criteria, logistics freights, and weight inspection terms..." 
                className="bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500"
                rows={4} 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 text-xs font-bold uppercase tracking-wider">Contract Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-full bg-slate-50 border-slate-200 text-slate-950">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="max-h-64 bg-white text-slate-950 border-slate-200">
                  {CURRENCIES.map(c => (
                    <SelectItem key={c.code} value={c.code}>
                      <span className="flex items-center gap-2">
                        <span>{c.flag}</span>
                        <span className="font-mono font-semibold">{c.code}</span>
                        <span className="text-slate-400">– {c.name}</span>
                        <span className="ml-auto text-slate-400 font-mono">{c.symbol}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-400">All escrow calculations will use this currency.</p>
            </div>
            <div className="space-y-2 flex flex-col">
              <Label className="text-slate-700 text-xs font-bold uppercase tracking-wider">Contract Expiration Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal border-slate-200 text-slate-900 bg-slate-50 hover:bg-slate-100", !expiresAt && "text-slate-400")}>
                    <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
                    {expiresAt ? format(expiresAt, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white border-slate-200">
                  <Calendar mode="single" selected={expiresAt} onSelect={(d) => d && setExpiresAt(d)} initialFocus className="text-slate-900 bg-white" />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2 flex flex-col">
              <Label className="text-slate-700 text-xs font-bold uppercase tracking-wider">Bill of Lading / Trade Document (Optional)</Label>
              <Input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  setDocumentFile(e.target.files[0]);
                }
              }} className="bg-slate-50 border-slate-200 text-slate-900 cursor-pointer focus:bg-white" />
            </div>
          </CardContent>
        </Card>

        {/* Unified Payout Value & Checklist Block */}
        <Card className="border border-slate-100 shadow-sm bg-white rounded-xl">
          <CardHeader className="border-b border-slate-100 bg-slate-50/30 py-4 px-6">
            <CardTitle className="text-base font-semibold text-slate-800">Escrow Payment & Document Gates</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="totalValue" className="text-slate-700 text-xs font-bold uppercase tracking-wider">Total Trade Escrow Value ({currency})</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">
                  {getCurrencySymbol(currency)}
                </span>
                <Input 
                  id="totalValue"
                  type="number" 
                  step="0.01" 
                  min="0.01" 
                  required 
                  className="pl-8 bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500 font-bold" 
                  value={totalValue} 
                  onChange={e => setTotalValue(e.target.value)} 
                  placeholder="0.00" 
                />
              </div>
              <p className="text-xs text-slate-400">
                This total amount will be locked in the secure nodal vault and released only when documents are cleared.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Label className="text-slate-700 text-xs font-bold uppercase tracking-wider">Required Verification Documents</Label>
              <p className="text-xs text-slate-400 mb-4">
                Select the documentation the parties must upload to verify cargo status before funds release.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <label className="flex items-center gap-3 cursor-pointer group text-sm text-slate-700 hover:text-slate-950 font-medium">
                  <input 
                    type="checkbox" 
                    checked={requiredDocs.invoice} 
                    onChange={e => setRequiredDocs({...requiredDocs, invoice: e.target.checked})}
                    className="w-4 h-4 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500" 
                  />
                  <span>Commercial Invoice & Packing List</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group text-sm text-slate-700 hover:text-slate-950 font-medium">
                  <input 
                    type="checkbox" 
                    checked={requiredDocs.packingList} 
                    onChange={e => setRequiredDocs({...requiredDocs, packingList: e.target.checked})}
                    className="w-4 h-4 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500" 
                  />
                  <span>Freight Cargo Packing Specification</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group text-sm text-slate-700 hover:text-slate-950 font-medium">
                  <input 
                    type="checkbox" 
                    checked={requiredDocs.billOfLading} 
                    onChange={e => setRequiredDocs({...requiredDocs, billOfLading: e.target.checked})}
                    className="w-4 h-4 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500" 
                  />
                  <span>Bill of Lading (BoL) / Transit Docket</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group text-sm text-slate-700 hover:text-slate-950 font-medium">
                  <input 
                    type="checkbox" 
                    checked={requiredDocs.inspectionCertificate} 
                    onChange={e => setRequiredDocs({...requiredDocs, inspectionCertificate: e.target.checked})}
                    className="w-4 h-4 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500" 
                  />
                  <span>Quality Certificate (SGS Inspection)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group text-sm text-slate-700 hover:text-slate-950 font-medium">
                  <input 
                    type="checkbox" 
                    checked={requiredDocs.billOfEntry} 
                    onChange={e => setRequiredDocs({...requiredDocs, billOfEntry: e.target.checked})}
                    className="w-4 h-4 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500" 
                  />
                  <span>Import Bill of Entry (Customs Clearance)</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" className="w-full px-8 hover-elevate bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-lg text-sm tracking-wide shadow-md" disabled={createProject.isPending || createMilestone.isPending || isUploading}>
            {createProject.isPending || isUploading ? "Creating Escrow Contract..." : "Create Escrow Contract"}
          </Button>
        </div>
      </form>
    </div>
  );
}
