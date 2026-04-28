import { Role } from "@prisma/client";
import { Router } from "express";
import { projectController } from "../controllers/projectController";
import { asyncHandler } from "../middlewares/asyncHandler";
import { requireAuth } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";
import { validate } from "../middlewares/validate";
import { idParamSchema } from "../validators/commonValidators";
import { createProjectSchema, projectListQuerySchema, updateProjectSchema } from "../validators/projectValidators";

const router = Router();

router.get("/", requireAuth, validate(projectListQuerySchema, "query"), asyncHandler(projectController.listProjects));
router.get("/:id", requireAuth, validate(idParamSchema, "params"), asyncHandler(projectController.getProject));
router.post(
  "/",
  requireAuth,
  authorizeRoles(Role.ADMIN, Role.PROJECT_MANAGER),
  validate(createProjectSchema),
  asyncHandler(projectController.createProject),
);
router.put(
  "/:id",
  requireAuth,
  authorizeRoles(Role.ADMIN, Role.PROJECT_MANAGER),
  validate(idParamSchema, "params"),
  validate(updateProjectSchema),
  asyncHandler(projectController.updateProject),
);
router.patch(
  "/:id/archive",
  requireAuth,
  authorizeRoles(Role.ADMIN),
  validate(idParamSchema, "params"),
  asyncHandler(projectController.archiveProject),
);

export default router;
