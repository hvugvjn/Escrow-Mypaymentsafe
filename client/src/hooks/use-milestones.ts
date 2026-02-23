import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { InsertMilestone } from "@shared/schema";

export function useCreateMilestone() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ projectId, data }: { projectId: string; data: InsertMilestone }) => {
      const url = buildUrl(api.milestones.create.path, { projectId });
      const res = await fetch(url, {
        method: api.milestones.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create milestone");
      return api.milestones.create.responses[201].parse(await res.json());
    },
    onError: (error) => {
      toast({ title: "Error creating milestone", description: error.message, variant: "destructive" });
    }
  });
}

export function useSubmitMilestone() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, submissionUrl }: { id: string; submissionUrl: string }) => {
      const url = buildUrl(api.milestones.submit.path, { id });
      const res = await fetch(url, {
        method: api.milestones.submit.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionUrl }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to submit milestone");
      return api.milestones.submit.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.projects.get.path] });
      toast({ title: "Milestone Submitted", description: "Your work is pending approval." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}

export function useApproveMilestone() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const url = buildUrl(api.milestones.approve.path, { id });
      const res = await fetch(url, {
        method: api.milestones.approve.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to approve milestone");
      return api.milestones.approve.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.projects.get.path] });
      toast({ title: "Milestone Approved", description: "Funds have been released to the freelancer." });
    },
    onError: (error) => {
      toast({ title: "Approval Failed", description: error.message, variant: "destructive" });
    }
  });
}

export function useRequestRevision() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const url = buildUrl(api.milestones.requestRevision.path, { id });
      const res = await fetch(url, {
        method: api.milestones.requestRevision.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to request revision");
      return api.milestones.requestRevision.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.projects.get.path] });
      toast({ title: "Revision Requested", description: "The freelancer has been notified." });
    },
  });
}
