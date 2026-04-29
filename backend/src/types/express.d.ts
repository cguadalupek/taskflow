import type { Role } from "@prisma/client";
import "express-serve-static-core";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        name: string;
        role: Role;
      };
      validated?: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      };
    }
  }
}

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: number;
      email: string;
      name: string;
      role: Role;
    };
    validated?: {
      body?: unknown;
      query?: unknown;
      params?: unknown;
    };
  }
}

export {};
