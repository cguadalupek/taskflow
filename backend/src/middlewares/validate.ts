import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";

export function validate(schema: ZodTypeAny, source: "body" | "query" | "params" = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.parse(req[source]);

    if (source === "body") {
      req.body = parsed;
      return next();
    }

    const target = req[source] as Record<string, unknown>;
    Object.keys(target).forEach((key) => {
      delete target[key];
    });
    Object.assign(target, parsed);

    next();
  };
}
