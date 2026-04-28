import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { env } from "../config/env";
import { ApiError } from "../utils/apiError";
import { logger } from "../utils/logger";

export function notFoundMiddleware(_req: Request, _res: Response, next: NextFunction) {
  next(new ApiError(404, "Recurso no encontrado"));
}

export function errorMiddleware(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      ...(error.errors ? { errors: error.errors } : {}),
    });
  }

  if (error instanceof ZodError) {
    const fieldErrors = error.flatten().fieldErrors;
      return res.status(422).json({
        success: false,
        message: "Error de validación",
        errors: Object.fromEntries(
          Object.entries(fieldErrors).map(([field, messages]) => [
            field,
            Array.isArray(messages) ? messages.filter(Boolean) : [],
          ]),
        ),
      });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const fields = (error.meta?.target as string[]) ?? ["field"];
      const errors = Object.fromEntries(fields.map((field) => [field, ["El valor ya está registrado"]]));
      return res.status(422).json({
        success: false,
        message: "Error de validación",
        errors,
      });
    }

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Recurso no encontrado",
      });
    }
  }

  logger.error("Unhandled error", error instanceof Error ? { message: error.message, stack: error.stack } : { error });

  return res.status(500).json({
    success: false,
    message: env.APP_ENV === "production" ? "Error interno del servidor" : "Error interno del servidor",
  });
}
