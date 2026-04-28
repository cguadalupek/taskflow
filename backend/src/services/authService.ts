import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";
import { createAuthToken } from "../utils/auth";
import { publicUserSelect } from "../utils/selects";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  avatarUrl?: string;
};

type LoginInput = {
  email: string;
  password: string;
};

export const authService = {
  async register(input: RegisterInput) {
    const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        avatarUrl: input.avatarUrl,
        role: Role.DEVELOPER,
      },
      select: publicUserSelect,
    });

    return user;
  },

  async login(input: LoginInput) {
    const user = await prisma.user.findFirst({
      where: { email: input.email, deletedAt: null },
    });

    if (!user) {
      throw new ApiError(401, "Credenciales inválidas");
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);

    if (!isMatch) {
      throw new ApiError(401, "Credenciales inválidas");
    }

    const token = createAuthToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        deletedAt: user.deletedAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  },

  async getCurrentUser(userId: number) {
    return prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: publicUserSelect,
    });
  },
};
