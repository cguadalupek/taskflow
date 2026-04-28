import { priorityLabels, statusLabels } from "@/lib/constants";
import type { ProjectStatus, TaskPriority, TaskStatus } from "@/types";

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const className =
    {
      TODO: "text-bg-secondary",
      IN_PROGRESS: "text-bg-primary",
      IN_REVIEW: "text-bg-warning",
      DONE: "text-bg-success",
    }[status] ?? "text-bg-secondary";

  return <span className={`badge ${className}`}>{statusLabels[status]}</span>;
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const className =
    {
      LOW: "text-bg-light border",
      MEDIUM: "text-bg-info",
      HIGH: "text-bg-warning",
      CRITICAL: "text-bg-danger",
    }[priority] ?? "text-bg-secondary";

  return <span className={`badge ${className}`}>{priorityLabels[priority]}</span>;
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className={`badge ${status === "ACTIVE" ? "text-bg-success" : "text-bg-dark"}`}>
      {status === "ACTIVE" ? "Active" : "Archived"}
    </span>
  );
}
