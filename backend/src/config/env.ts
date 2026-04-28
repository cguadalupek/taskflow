import { z } from "zod";

const envSchema = z.object({
  APP_PORT: z.coerce.number().int().positive().default(3000),
  APP_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(10),
  JWT_EXPIRATION: z.string().min(1).default("24h"),
  FRONTEND_URL: z.string().url(),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10).max(14).default(10),
});

export const env = envSchema.parse({
  APP_PORT: process.env.APP_PORT,
  APP_ENV: process.env.APP_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRATION: process.env.JWT_EXPIRATION,
  FRONTEND_URL: process.env.FRONTEND_URL,
  BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS,
});
