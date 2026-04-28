import type { NextFunction, Request, Response } from "express";
import { sanitizeValue } from "../utils/sanitize";

export function sanitizeRequest(req: Request, _res: Response, next: NextFunction) {
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }

  if (req.query) {
    Object.assign(req.query, sanitizeValue({ ...req.query }));
  }

  next();
}
