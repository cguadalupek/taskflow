import type { Request, Response } from "express";
import { authService } from "../services/authService";
import { getCookieOptions, COOKIE_NAME } from "../utils/auth";
import { sendSuccess } from "../utils/response";

export const authController = {
  async register(req: Request, res: Response) {
    const user = await authService.register(req.body);
    return sendSuccess(res, {
      statusCode: 201,
      message: "Usuario registrado correctamente",
      data: user,
    });
  },

  async login(req: Request, res: Response) {
    const { token, user } = await authService.login(req.body);
    res.cookie(COOKIE_NAME, token, getCookieOptions());

    return sendSuccess(res, {
      message: "Inicio de sesión correcto",
      data: user,
    });
  },

  async logout(_req: Request, res: Response) {
    res.clearCookie(COOKIE_NAME, getCookieOptions());

    return sendSuccess(res, {
      message: "Sesión cerrada correctamente",
    });
  },

  async me(req: Request, res: Response) {
    const user = await authService.getCurrentUser(req.user!.id);
    return sendSuccess(res, {
      data: user,
    });
  },
};
