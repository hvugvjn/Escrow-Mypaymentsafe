import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusType = "WAITING_FOR_ACCEPTANCE" | "WAITING_FOR_FUNDING" | "ACTIVE" | "COMPLETED" | "CANCELLED" | "PENDING" | "SUBMITTED" | "APPROVED" | "REVISION_REQUESTED";

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const getStatusConfig = (s: string) => {
    switch (s) {
      case "ACTIVE":
      case "APPROVED":
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
      case "WAITING_FOR_FUNDING":
      case "WAITING_FOR_ACCEPTANCE":
      case "PENDING":
        return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
      case "SUBMITTED":
      case "REVISION_REQUESTED":
        return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
      case "CANCELLED":
        return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const formatText = (s: string) => {
    return s.replace(/_/g, " ");
  };

  return (
    <Badge variant="outline" className={cn("font-semibold border", getStatusConfig(status), className)}>
      {formatText(status)}
    </Badge>
  );
}
