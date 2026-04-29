import jwt, { type SignOptions } from "jsonwebtoken";
import { Role } from "@prisma/client";
import { env } from "../config/env";

export const COOKIE_NAME = "taskflow_token";

export type AuthTokenPayload = {
  id: number;
  email: string;
  name: string;
  role: Role;
};

export function createAuthToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRATION,
  } as SignOptions);
}

export function verifyAuthToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
}

export function getCookieOptions() {
  const isProduction = env.APP_ENV === "production";

  return {
    httpOnly: true,
    sameSite: isProduction ? ("none" as const) : ("lax" as const),
    secure: isProduction,
    path: "/",
  };
}
