import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";
import { COOKIE_NAME, verifyAuthToken } from "../utils/auth";

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies[COOKIE_NAME];

  if (!token) {
    return next(new ApiError(401, "No autenticado"));
  }

  try {
    const payload = verifyAuthToken(token);
    const user = await prisma.user.findFirst({
      where: { id: payload.id, deletedAt: null },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      return next(new ApiError(401, "La sesión no es válida"));
    }

    req.user = user;
    next();
  } catch {
    next(new ApiError(401, "La sesión no es válida"));
  }
}
