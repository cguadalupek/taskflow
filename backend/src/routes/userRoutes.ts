import { Role } from "@prisma/client";
import { Router } from "express";
import { userController } from "../controllers/userController";
import { asyncHandler } from "../middlewares/asyncHandler";
import { requireAuth } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";
import { validate } from "../middlewares/validate";
import { idParamSchema } from "../validators/commonValidators";
import { createUserSchema, updateProfileSchema, updateUserSchema, userListQuerySchema } from "../validators/userValidators";

const router = Router();

router.get("/profile", requireAuth, asyncHandler(userController.getProfile));
router.get("/options", requireAuth, asyncHandler(userController.listAssignableUsers));
router.put("/profile", requireAuth, validate(updateProfileSchema), asyncHandler(userController.updateProfile));
router.get("/", requireAuth, authorizeRoles(Role.ADMIN), validate(userListQuerySchema, "query"), asyncHandler(userController.listUsers));
router.post("/", requireAuth, authorizeRoles(Role.ADMIN), validate(createUserSchema), asyncHandler(userController.createUser));
router.get("/:id", requireAuth, authorizeRoles(Role.ADMIN), validate(idParamSchema, "params"), asyncHandler(userController.getUser));
router.put("/:id", requireAuth, authorizeRoles(Role.ADMIN), validate(idParamSchema, "params"), validate(updateUserSchema), asyncHandler(userController.updateUser));
router.delete("/:id", requireAuth, authorizeRoles(Role.ADMIN), validate(idParamSchema, "params"), asyncHandler(userController.deleteUser));

export default router;
