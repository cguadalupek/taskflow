import type { ProjectStatus, Role, TaskPriority, TaskStatus } from "@/types";

export const roles: Role[] = ["ADMIN", "PROJECT_MANAGER", "DEVELOPER"];
export const projectStatuses: ProjectStatus[] = ["ACTIVE", "ARCHIVED"];
export const taskStatuses: TaskStatus[] = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];
export const taskPriorities: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export const roleLabels: Record<Role, string> = {
  ADMIN: "Admin",
  PROJECT_MANAGER: "Project Manager",
  DEVELOPER: "Developer",
};

export const statusLabels: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
};

export const priorityLabels: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};
