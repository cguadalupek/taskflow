export type Role = "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER";
export type ProjectStatus = "ACTIVE" | "ARCHIVED";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
  message: string;
  meta?: PaginationMeta;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
};

export type BasicUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
};

export type User = BasicUser & {
  avatarUrl?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Project = {
  id: number;
  name: string;
  description: string;
  status: ProjectStatus;
  ownerId?: number;
  owner: BasicUser;
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
  _count?: {
    tasks: number;
  };
};

export type Task = {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: number;
  assignedToId: number;
  createdById: number;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  project: Project;
  assignedTo: BasicUser;
  createdBy: BasicUser;
};

export type DashboardSummary = {
  taskCounts: Record<TaskStatus, number>;
  upcomingTasks: Task[];
  recentActivity: Task[];
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  avatarUrl?: string;
};

export type ProjectPayload = {
  name: string;
  description: string;
};

export type TaskPayload = {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  projectId?: number;
  assignedToId?: number;
  dueDate?: string;
  status?: TaskStatus;
};

export type UserPayload = {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
  avatarUrl?: string | null;
};
