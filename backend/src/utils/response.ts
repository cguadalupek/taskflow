import type { Response } from "express";

type SuccessOptions = {
  statusCode?: number;
  message?: string;
  data?: unknown;
  meta?: Record<string, unknown>;
};

export function sendSuccess(res: Response, options: SuccessOptions = {}) {
  const { statusCode = 200, message = "Operación realizada correctamente", data = null, meta } = options;

  return res.status(statusCode).json({
    success: true,
    data,
    message,
    ...(meta ? { meta } : {}),
  });
}
