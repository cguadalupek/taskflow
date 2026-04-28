import type { Request, Response } from "express";
import { projectService } from "../services/projectService";
import { sendSuccess } from "../utils/response";

export const projectController = {
  async listProjects(req: Request, res: Response) {
    const result = await projectService.listProjects(req.user!, (req.validated?.query ?? req.query) as never);
    return sendSuccess(res, {
      data: result.data,
      meta: result.meta,
    });
  },

  async getProject(req: Request, res: Response) {
    const params = (req.validated?.params ?? req.params) as { id: number | string };
    const project = await projectService.getProjectById(req.user!, Number(params.id));
    return sendSuccess(res, {
      data: project,
    });
  },

  async createProject(req: Request, res: Response) {
    const project = await projectService.createProject(req.user!, req.body);
    return sendSuccess(res, {
      statusCode: 201,
      message: "Proyecto creado correctamente",
      data: project,
    });
  },

  async updateProject(req: Request, res: Response) {
    const params = (req.validated?.params ?? req.params) as { id: number | string };
    const project = await projectService.updateProject(req.user!, Number(params.id), req.body);
    return sendSuccess(res, {
      message: "Proyecto actualizado correctamente",
      data: project,
    });
  },

  async archiveProject(req: Request, res: Response) {
    const params = (req.validated?.params ?? req.params) as { id: number | string };
    const project = await projectService.archiveProject(Number(params.id));
    return sendSuccess(res, {
      message: "Proyecto archivado correctamente",
      data: project,
    });
  },
};
