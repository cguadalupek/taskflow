import { Role } from "@prisma/client";
import { z } from "zod";
import { paginationQuerySchema } from "./commonValidators";

const passwordSchema = z
  .string()
  .min(8)
  .regex(/[A-Z]/, "La contraseña debe contener al menos una mayúscula")
  .regex(/[a-z]/, "La contraseña debe contener al menos una minúscula")
  .regex(/[0-9]/, "La contraseña debe contener al menos un número")
  .regex(/[^A-Za-z0-9]/, "La contraseña debe contener al menos un carácter especial");

export const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: passwordSchema,
  role: z.nativeEnum(Role),
  avatarUrl: z.string().url().nullable().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  role: z.nativeEnum(Role).optional(),
  avatarUrl: z.string().url().nullable().optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  avatarUrl: z.string().url().nullable().optional(),
});

export const userListQuerySchema = paginationQuerySchema;
