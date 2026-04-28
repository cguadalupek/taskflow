import { TaskPriority, TaskStatus } from "@prisma/client";
import { z } from "zod";
import { paginationQuerySchema } from "./commonValidators";

export const createTaskSchema = z.object({
  title: z.string().min(2).max(160),
  description: z.string().min(5).max(1000),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  projectId: z.coerce.number().int().positive(),
  assignedToId: z.coerce.number().int().positive().optional(),
  dueDate: z.coerce.date(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(2).max(160).optional(),
  description: z.string().min(5).max(1000).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  assignedToId: z.coerce.number().int().positive().optional(),
  dueDate: z.coerce.date().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
});

export const taskStatusSchema = z.object({
  status: z.nativeEnum(TaskStatus),
});

export const taskListQuerySchema = paginationQuerySchema.extend({
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  assignedTo: z.coerce.number().int().positive().optional(),
  projectId: z.coerce.number().int().positive().optional(),
});
