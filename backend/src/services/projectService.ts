import { ProjectStatus, Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";
import { buildPaginationMeta } from "../utils/pagination";

type ProjectListQuery = {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder: "asc" | "desc";
  status?: ProjectStatus;
};

type ProjectInput = {
  name?: string;
  description?: string;
};

function getProjectVisibilityScope(user: NonNullable<Express.Request["user"]>) {
  if (user.role === Role.ADMIN) {
    return {};
  }

  if (user.role === Role.PROJECT_MANAGER) {
    return { ownerId: user.id };
  }

  return {
    tasks: {
      some: {
        assignedToId: user.id,
      },
    },
  };
}

export const projectService = {
  async listProjects(user: NonNullable<Express.Request["user"]>, query: ProjectListQuery) {
    const page = Number(query.page);
    const limit = Number(query.limit);
    const sortBy = query.sortBy ?? "createdAt";
    const sortOrder = query.sortOrder;
    const status = query.status;
    const where = {
      ...getProjectVisibilityScope(user),
      ...(status ? { status } : {}),
    };

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          owner: {
            select: { id: true, name: true, email: true, role: true },
          },
          _count: { select: { tasks: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.project.count({ where }),
    ]);

    return {
      data: projects,
      meta: buildPaginationMeta(page, limit, total),
    };
  },

  async getProjectById(user: NonNullable<Express.Request["user"]>, id: number) {
    const project = await prisma.project.findFirst({
      where: {
        id,
        ...getProjectVisibilityScope(user),
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true, role: true },
        },
        tasks: {
          where: user.role === Role.DEVELOPER ? { assignedToId: user.id } : undefined,
          include: {
            assignedTo: {
              select: { id: true, name: true, email: true, role: true },
            },
            createdBy: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!project) {
      throw new ApiError(404, "Proyecto no encontrado");
    }

    return project;
  },

  async createProject(user: NonNullable<Express.Request["user"]>, input: Required<ProjectInput>) {
    const ownerId = user.role === Role.ADMIN ? user.id : user.id;

    return prisma.project.create({
      data: {
        name: input.name,
        description: input.description,
        ownerId,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
  },

  async updateProject(user: NonNullable<Express.Request["user"]>, id: number, input: ProjectInput) {
    const project = await prisma.project.findUnique({ where: { id } });

    if (!project) {
      throw new ApiError(404, "Proyecto no encontrado");
    }

    if (user.role === Role.PROJECT_MANAGER && project.ownerId !== user.id) {
      throw new ApiError(403, "No puedes editar este proyecto");
    }

    if (user.role === Role.DEVELOPER) {
      throw new ApiError(403, "No puedes editar proyectos");
    }

    return prisma.project.update({
      where: { id },
      data: input,
      include: {
        owner: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
  },

  async archiveProject(id: number) {
    const project = await prisma.project.findUnique({ where: { id } });

    if (!project) {
      throw new ApiError(404, "Proyecto no encontrado");
    }

    return prisma.project.update({
      where: { id },
      data: { status: ProjectStatus.ARCHIVED },
      include: {
        owner: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
  },

  async deleteProject(id: number) {
    const project = await prisma.project.findUnique({ where: { id } });

    if (!project) {
      throw new ApiError(404, "Proyecto no encontrado");
    }

    await prisma.$transaction([
      prisma.task.deleteMany({ where: { projectId: id } }),
      prisma.project.delete({ where: { id } }),
    ]);
  },

  async ensureProjectManageAccess(user: NonNullable<Express.Request["user"]>, projectId: number) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });

    if (!project) {
      throw new ApiError(404, "Proyecto no encontrado");
    }

    if (user.role === Role.ADMIN) {
      return project;
    }

    if (user.role === Role.PROJECT_MANAGER && project.ownerId === user.id) {
      return project;
    }

    throw new ApiError(403, "No puedes gestionar este proyecto");
  },

  async ensureDeveloperTaskCreationAccess(user: NonNullable<Express.Request["user"]>, projectId: number) {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        tasks: {
          some: {
            assignedToId: user.id,
          },
        },
      },
    });

    if (!project) {
      throw new ApiError(403, "No puedes crear tareas en este proyecto");
    }

    return project;
  },
};
