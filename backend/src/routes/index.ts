import { Router } from "express";
import authRoutes from "./authRoutes";
import dashboardRoutes from "./dashboardRoutes";
import projectRoutes from "./projectRoutes";
import taskRoutes from "./taskRoutes";
import userRoutes from "./userRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/projects", projectRoutes);
router.use("/tasks", taskRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
