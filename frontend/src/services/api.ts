import type {
  ApiErrorResponse,
  ApiSuccess,
  DashboardSummary,
  LoginPayload,
  Project,
  ProjectPayload,
  RegisterPayload,
  Task,
  TaskPayload,
  User,
  UserPayload,
} from "@/types";

const API_BASE_URL = "/api/v1";

export class ApiClientError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

async function request<T>(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);

  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  const payload = (await response.json().catch(() => null)) as ApiSuccess<T> | ApiErrorResponse | null;

  if (!response.ok) {
    const errorPayload = payload as ApiErrorResponse | null;
    throw new ApiClientError(errorPayload?.message ?? "Request failed", response.status, errorPayload?.errors);
  }

  return payload as ApiSuccess<T>;
}

function createQueryString(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

export const api = {
  register(payload: RegisterPayload) {
    return request<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  login(payload: LoginPayload) {
    return request<User>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  logout() {
    return request<null>("/auth/logout", {
      method: "POST",
    });
  },

  getCurrentUser() {
    return request<User>("/auth/me");
  },

  getDashboard() {
    return request<DashboardSummary>("/dashboard");
  },

  getProjects(params: Record<string, string | number | undefined> = {}) {
    return request<Project[]>(`/projects${createQueryString(params)}`);
  },

  getProject(id: number) {
    return request<Project>(`/projects/${id}`);
  },

  createProject(payload: ProjectPayload) {
    return request<Project>("/projects", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateProject(id: number, payload: ProjectPayload) {
    return request<Project>(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  archiveProject(id: number) {
    return request<Project>(`/projects/${id}/archive`, {
      method: "PATCH",
    });
  },

  deleteProject(id: number) {
    return request<null>(`/projects/${id}`, {
      method: "DELETE",
    });
  },

  getTasks(params: Record<string, string | number | undefined> = {}) {
    return request<Task[]>(`/tasks${createQueryString(params)}`);
  },

  getTask(id: number) {
    return request<Task>(`/tasks/${id}`);
  },

  createTask(payload: TaskPayload) {
    return request<Task>("/tasks", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateTask(id: number, payload: TaskPayload) {
    return request<Task>(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  updateTaskStatus(id: number, status: string) {
    return request<Task>(`/tasks/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  deleteTask(id: number) {
    return request<null>(`/tasks/${id}`, {
      method: "DELETE",
    });
  },

  getUsers(params: Record<string, string | number | undefined> = {}) {
    return request<User[]>(`/users${createQueryString(params)}`);
  },

  getAssignableUsers() {
    return request<User[]>("/users/options");
  },

  createUser(payload: UserPayload) {
    return request<User>("/users", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateUser(id: number, payload: UserPayload) {
    return request<User>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  deleteUser(id: number) {
    return request<User>(`/users/${id}`, {
      method: "DELETE",
    });
  },

  getProfile() {
    return request<User>("/users/profile");
  },

  updateProfile(payload: UserPayload) {
    return request<User>("/users/profile", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
};
