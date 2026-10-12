import { Router } from "express";
import { generateDestinationTips } from "../controllers/ai.controller";

const aiRoutes = Router();

// aiRoutes.get(
//   "/destinations/:destinationId/summary",
//   protect,
//   generateDestinationSummary,
// );

aiRoutes.get("/destinations/:destinationId/tips", generateDestinationTips);

export default aiRoutes;
