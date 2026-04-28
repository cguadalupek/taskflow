import type { Request, Response } from "express";
import { userService } from "../services/userService";
import { sendSuccess } from "../utils/response";

export const userController = {
  async listAssignableUsers(_req: Request, res: Response) {
    const users = await userService.listAssignableUsers();
    return sendSuccess(res, {
      data: users,
    });
  },

  async listUsers(req: Request, res: Response) {
    const result = await userService.listUsers(req.query as never);
    return sendSuccess(res, {
      data: result.data,
      meta: result.meta,
    });
  },

  async createUser(req: Request, res: Response) {
    const user = await userService.createUser(req.body);
    return sendSuccess(res, {
      statusCode: 201,
      message: "Usuario creado correctamente",
      data: user,
    });
  },

  async getUser(req: Request, res: Response) {
    const user = await userService.getUserById(Number(req.params.id));
    return sendSuccess(res, {
      data: user,
    });
  },

  async updateUser(req: Request, res: Response) {
    const user = await userService.updateUser(Number(req.params.id), req.body);
    return sendSuccess(res, {
      message: "Usuario actualizado correctamente",
      data: user,
    });
  },

  async deleteUser(req: Request, res: Response) {
    const user = await userService.softDeleteUser(Number(req.params.id));
    return sendSuccess(res, {
      message: "Usuario eliminado correctamente",
      data: user,
    });
  },

  async getProfile(req: Request, res: Response) {
    const user = await userService.getUserById(req.user!.id);
    return sendSuccess(res, {
      data: user,
    });
  },

  async updateProfile(req: Request, res: Response) {
    const user = await userService.updateProfile(req.user!.id, req.body);
    return sendSuccess(res, {
      message: "Perfil actualizado correctamente",
      data: user,
    });
  },
};
