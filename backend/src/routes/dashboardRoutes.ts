import { Router } from "express";
import { dashboardController } from "../controllers/dashboardController";
import { asyncHandler } from "../middlewares/asyncHandler";
import { requireAuth } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", requireAuth, asyncHandler(dashboardController.getSummary));

export default router;
