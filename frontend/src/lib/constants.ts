import type { ProjectStatus, Role, TaskPriority, TaskStatus } from "@/types";

export const roles: Role[] = ["ADMIN", "PROJECT_MANAGER", "DEVELOPER"];
export const projectStatuses: ProjectStatus[] = ["ACTIVE", "ARCHIVED"];
export const taskStatuses: TaskStatus[] = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];
export const taskPriorities: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export const roleLabels: Record<Role, string> = {
  ADMIN: "Admin",
  PROJECT_MANAGER: "Lider de proyecto",
  DEVELOPER: "Desarrollador",
};

export const statusLabels: Record<TaskStatus, string> = {
  TODO: "Por hacer",
  IN_PROGRESS: "En progreso",
  IN_REVIEW: "En revision",
  DONE: "Completada",
};

export const priorityLabels: Record<TaskPriority, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
  CRITICAL: "Critica",
};
