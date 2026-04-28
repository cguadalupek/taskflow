import type { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";
import { ApiError } from "../utils/apiError";

export function authorizeRoles(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, "No autenticado"));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, "No tienes permisos para realizar esta acción"));
    }

    next();
  };
}
