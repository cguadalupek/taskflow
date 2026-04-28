import { ProjectStatus } from "@prisma/client";
import { z } from "zod";
import { paginationQuerySchema } from "./commonValidators";

export const createProjectSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().min(5).max(500),
});

export const updateProjectSchema = createProjectSchema.partial();

export const archiveProjectSchema = z.object({
  status: z.nativeEnum(ProjectStatus),
});

export const projectListQuerySchema = paginationQuerySchema.extend({
  status: z.nativeEnum(ProjectStatus).optional(),
});
