import { Router } from "express";
import {
  generateDestinationSummary,
  generateDestinationTips,
  regenerateDestinationSummary,
} from "../controllers/ai.controller";
import { protect, restrictTo } from "../middleware/auth.middleware";

const aiRoutes = Router();

aiRoutes.get("/destinations/:destinationId/summary", generateDestinationSummary);
aiRoutes.post(
  "/destinations/:destinationId/summary/regenerate",
  protect,
  restrictTo("admin"),
  regenerateDestinationSummary,
);

aiRoutes.get("/destinations/:destinationId/tips", generateDestinationTips);

export default aiRoutes;
