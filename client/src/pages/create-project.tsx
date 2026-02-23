import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateProject } from "@/hooks/use-projects";
import { useCreateMilestone } from "@/hooks/use-milestones";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CreateProject() {
  const [, setLocation] = useLocation();
  const createProject = useCreateProject();
  const createMilestone = useCreateMilestone();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [expiresAt, setExpiresAt] = useState<Date>(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  
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
      // 1. Create Project
      const project = await createProject.mutateAsync({
        title,
        description,
        expiresAt
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
        <h1 className="text-3xl font-display font-bold">Create New Project</h1>
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
            <div className="space-y-2 flex flex-col">
              <Label>Invite Expires At</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-[240px] justify-start text-left font-normal", !expiresAt && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expiresAt ? format(expiresAt, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={expiresAt} onSelect={(d) => d && setExpiresAt(d)} initialFocus />
                </PopoverContent>
              </Popover>
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
                    <Label>Amount (USD)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                      <Input type="number" step="0.01" min="1" required className="pl-7" value={milestone.amountInput} onChange={e => {
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
          <Button type="submit" size="lg" className="w-full md:w-auto px-8 hover-elevate" disabled={createProject.isPending || createMilestone.isPending}>
            {createProject.isPending ? "Creating..." : "Create Project & Escrow"}
          </Button>
        </div>
      </form>
    </div>
  );
}
