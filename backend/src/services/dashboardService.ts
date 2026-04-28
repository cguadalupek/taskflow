import { Role, TaskStatus } from "@prisma/client";
import { prisma } from "../config/prisma";

function getTaskScope(user: Express.Request["user"]) {
  if (!user) {
    return {};
  }

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

export const dashboardService = {
  async getSummary(user: NonNullable<Express.Request["user"]>) {
    const taskWhere = getTaskScope(user);
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const [counts, upcomingTasks, recentTasks] = await Promise.all([
      prisma.task.groupBy({
        by: ["status"],
        _count: { status: true },
        where: taskWhere,
      }),
      prisma.task.findMany({
        where: {
          ...taskWhere,
          dueDate: {
            gte: new Date(),
            lte: sevenDaysFromNow,
          },
        },
        orderBy: { dueDate: "asc" },
        take: 5,
        include: {
          project: true,
          assignedTo: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      }),
      prisma.task.findMany({
        where: taskWhere,
        orderBy: { updatedAt: "desc" },
        take: 5,
        include: {
          project: true,
          assignedTo: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      }),
    ]);

    const countMap = Object.values(TaskStatus).reduce<Record<string, number>>((accumulator, status) => {
      accumulator[status] = 0;
      return accumulator;
    }, {});

    counts.forEach((entry) => {
      countMap[entry.status] = entry._count.status;
    });

    return {
      taskCounts: countMap,
      upcomingTasks,
      recentActivity: recentTasks,
    };
  },
};
