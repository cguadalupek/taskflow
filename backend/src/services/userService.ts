import bcrypt from "bcryptjs";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";
import { buildPaginationMeta } from "../utils/pagination";
import { publicUserSelect } from "../utils/selects";

type UserListQuery = {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder: "asc" | "desc";
};

type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER";
  avatarUrl?: string;
};

type UpdateUserInput = {
  name?: string;
  email?: string;
  role?: "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER";
  avatarUrl?: string | null;
};

type UpdateProfileInput = {
  name?: string;
  email?: string;
  avatarUrl?: string | null;
};

export const userService = {
  async listAssignableUsers() {
    return prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: { name: "asc" },
    });
  },

  async listUsers(query: UserListQuery) {
    const { page, limit, sortBy = "createdAt", sortOrder } = query;
    const where = { deletedAt: null };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: publicUserSelect,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: buildPaginationMeta(page, limit, total),
    };
  },

  async createUser(input: CreateUserInput) {
    const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS);
    return prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        role: input.role,
        avatarUrl: input.avatarUrl,
      },
      select: publicUserSelect,
    });
  },

  async getUserById(id: number) {
    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: publicUserSelect,
    });

    if (!user) {
      throw new ApiError(404, "Usuario no encontrado");
    }

    return user;
  },

  async updateUser(id: number, input: UpdateUserInput) {
    await this.getUserById(id);
    return prisma.user.update({
      where: { id },
      data: input,
      select: publicUserSelect,
    });
  },

  async softDeleteUser(id: number) {
    await this.getUserById(id);
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: publicUserSelect,
    });
  },

  async updateProfile(userId: number, input: UpdateProfileInput) {
    await this.getUserById(userId);
    return prisma.user.update({
      where: { id: userId },
      data: input,
      select: publicUserSelect,
    });
  },
};
