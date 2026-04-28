import { Role } from "@prisma/client";
import { Router } from "express";
import { taskController } from "../controllers/taskController";
import { asyncHandler } from "../middlewares/asyncHandler";
import { requireAuth } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";
import { validate } from "../middlewares/validate";
import { idParamSchema } from "../validators/commonValidators";
import { createTaskSchema, taskListQuerySchema, taskStatusSchema, updateTaskSchema } from "../validators/taskValidators";

const router = Router();

router.get("/", requireAuth, validate(taskListQuerySchema, "query"), asyncHandler(taskController.listTasks));
router.get("/:id", requireAuth, validate(idParamSchema, "params"), asyncHandler(taskController.getTask));
router.post("/", requireAuth, validate(createTaskSchema), asyncHandler(taskController.createTask));
router.put("/:id", requireAuth, validate(idParamSchema, "params"), validate(updateTaskSchema), asyncHandler(taskController.updateTask));
router.patch(
  "/:id/status",
  requireAuth,
  validate(idParamSchema, "params"),
  validate(taskStatusSchema),
  asyncHandler(taskController.updateTaskStatus),
);
router.delete(
  "/:id",
  requireAuth,
  authorizeRoles(Role.ADMIN, Role.PROJECT_MANAGER),
  validate(idParamSchema, "params"),
  asyncHandler(taskController.deleteTask),
);

export default router;
