import type { Request, Response } from "express";
import { taskService } from "../services/taskService";
import { sendSuccess } from "../utils/response";

export const taskController = {
  async listTasks(req: Request, res: Response) {
    const result = await taskService.listTasks(req.user!, (req.validated?.query ?? req.query) as never);
    return sendSuccess(res, {
      data: result.data,
      meta: result.meta,
    });
  },

  async getTask(req: Request, res: Response) {
    const params = (req.validated?.params ?? req.params) as { id: number | string };
    const task = await taskService.getTaskById(req.user!, Number(params.id));
    return sendSuccess(res, {
      data: task,
    });
  },

  async createTask(req: Request, res: Response) {
    const task = await taskService.createTask(req.user!, req.body);
    return sendSuccess(res, {
      statusCode: 201,
      message: "Tarea creada correctamente",
      data: task,
    });
  },

  async updateTask(req: Request, res: Response) {
    const params = (req.validated?.params ?? req.params) as { id: number | string };
    const task = await taskService.updateTask(req.user!, Number(params.id), req.body);
    return sendSuccess(res, {
      message: "Tarea actualizada correctamente",
      data: task,
    });
  },

  async updateTaskStatus(req: Request, res: Response) {
    const params = (req.validated?.params ?? req.params) as { id: number | string };
    const task = await taskService.updateTaskStatus(req.user!, Number(params.id), req.body.status);
    return sendSuccess(res, {
      message: "Estado actualizado correctamente",
      data: task,
    });
  },

  async deleteTask(req: Request, res: Response) {
    const params = (req.validated?.params ?? req.params) as { id: number | string };
    await taskService.deleteTask(req.user!, Number(params.id));
    return sendSuccess(res, {
      message: "Tarea eliminada correctamente",
    });
  },
};
