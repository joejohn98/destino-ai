import { Router } from "express";
import {
  generateDestinationSummary,
  generateDestinationTips,
  regenerateDestinationSummary,
} from "../controllers/ai.controller";
import { protect, restrictTo } from "../middleware/auth.middleware";
import { aiLimiter } from "../middleware/ratelimit.middleware";

const aiRoutes = Router();

aiRoutes.get(
  "/destinations/:destinationId/summary",
  aiLimiter,
  generateDestinationSummary,
);
aiRoutes.post(
  "/destinations/:destinationId/summary/regenerate",
  protect,
  restrictTo("admin"),
  regenerateDestinationSummary,
);

aiRoutes.get(
  "/destinations/:destinationId/tips",
  aiLimiter,
  generateDestinationTips,
);

export default aiRoutes;
