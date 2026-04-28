import type { Request, Response } from "express";
import { dashboardService } from "../services/dashboardService";
import { sendSuccess } from "../utils/response";

export const dashboardController = {
  async getSummary(req: Request, res: Response) {
    const summary = await dashboardService.getSummary(req.user!);

    return sendSuccess(res, {
      data: summary,
    });
  },
};
