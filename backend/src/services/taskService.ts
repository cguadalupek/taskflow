import { Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";
import { buildPaginationMeta } from "../utils/pagination";
import { ensureValidTaskTransition } from "../utils/taskStatus";
import { projectService } from "./projectService";

type TaskListQuery = {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder: "asc" | "desc";
  status?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  assignedTo?: number;
  projectId?: number;
};

type CreateTaskInput = {
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  projectId: number;
  assignedToId?: number;
  dueDate: Date;
};

type UpdateTaskInput = {
  title?: string;
  description?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  assignedToId?: number;
  dueDate?: Date;
  status?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
};

function getTaskVisibilityScope(user: NonNullable<Express.Request["user"]>) {
  if (user.role === Role.ADMIN) {
    return {};
  }

  if (user.role === Role.PROJECT_MANAGER) {
    return {
      project: {
        ownerId: user.id,
      },
    };
  }

  return {
    assignedToId: user.id,
  };
}

export const taskService = {
  async listTasks(user: NonNullable<Express.Request["user"]>, query: TaskListQuery) {
    const { page, limit, sortBy = "createdAt", sortOrder, status, priority, assignedTo, projectId } = query;
    const where = {
      ...getTaskVisibilityScope(user),
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
      ...(assignedTo ? { assignedToId: assignedTo } : {}),
      ...(projectId ? { projectId } : {}),
    };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          project: true,
          assignedTo: {
            select: { id: true, name: true, email: true, role: true },
          },
          createdBy: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    return {
      data: tasks,
      meta: buildPaginationMeta(page, limit, total),
    };
  },

  async getTaskById(user: NonNullable<Express.Request["user"]>, id: number) {
    const task = await prisma.task.findFirst({
      where: {
        id,
        ...getTaskVisibilityScope(user),
      },
      include: {
        project: true,
        assignedTo: {
          select: { id: true, name: true, email: true, role: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    if (!task) {
      throw new ApiError(404, "Tarea no encontrada");
    }

    return task;
  },

  async createTask(user: NonNullable<Express.Request["user"]>, input: CreateTaskInput) {
    if (user.role === Role.DEVELOPER) {
      await projectService.ensureDeveloperTaskCreationAccess(user, input.projectId);

      if (input.assignedToId && input.assignedToId !== user.id) {
        throw new ApiError(403, "Solo puedes crear tareas autoasignadas");
      }
    } else {
      await projectService.ensureProjectManageAccess(user, input.projectId);
    }

    const assigneeId = user.role === Role.DEVELOPER ? user.id : input.assignedToId;

    if (!assigneeId) {
      throw new ApiError(422, "Debes asignar la tarea a un usuario", {
        assignedToId: ["Este campo es obligatorio"],
      });
    }

    const assignee = await prisma.user.findFirst({
      where: { id: assigneeId, deletedAt: null },
    });

    if (!assignee) {
      throw new ApiError(404, "Usuario asignado no encontrado");
    }

    return prisma.task.create({
      data: {
        title: input.title,
        description: input.description,
        priority: input.priority,
        projectId: input.projectId,
        assignedToId: assigneeId,
        createdById: user.id,
        dueDate: input.dueDate,
      },
      include: {
        project: true,
        assignedTo: {
          select: { id: true, name: true, email: true, role: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
  },

  async updateTask(user: NonNullable<Express.Request["user"]>, id: number, input: UpdateTaskInput) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!task) {
      throw new ApiError(404, "Tarea no encontrada");
    }

    if (user.role === Role.PROJECT_MANAGER && task.project.ownerId !== user.id) {
      throw new ApiError(403, "No puedes editar esta tarea");
    }

    if (user.role === Role.DEVELOPER) {
      if (task.assignedToId !== user.id) {
        throw new ApiError(403, "No puedes editar esta tarea");
      }

      if (input.priority || input.assignedToId) {
        throw new ApiError(403, "No puedes cambiar prioridad o asignación");
      }
    }

    if (input.status) {
      ensureValidTaskTransition(task.status, input.status);
    }

    return prisma.task.update({
      where: { id },
      data: input,
      include: {
        project: true,
        assignedTo: {
          select: { id: true, name: true, email: true, role: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
  },

  async updateTaskStatus(user: NonNullable<Express.Request["user"]>, id: number, status: UpdateTaskInput["status"]) {
    if (!status) {
      throw new ApiError(422, "Debes indicar un estado");
    }

    return this.updateTask(user, id, { status });
  },

  async deleteTask(user: NonNullable<Express.Request["user"]>, id: number) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!task) {
      throw new ApiError(404, "Tarea no encontrada");
    }

    if (user.role === Role.PROJECT_MANAGER && task.project.ownerId !== user.id) {
      throw new ApiError(403, "No puedes eliminar esta tarea");
    }

    if (user.role === Role.DEVELOPER) {
      throw new ApiError(403, "No puedes eliminar tareas");
    }

    await prisma.task.delete({ where: { id } });
  },
};
