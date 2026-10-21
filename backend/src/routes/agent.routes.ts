import { Router } from "express";
import {
  compareDestinations,
  generateItinerary,
} from "../controllers/agent.controller";
import { agentLimiter } from "../middleware/ratelimit.middleware";
import { validate } from "../middleware/validation.middleware";
import {
  compareRequestSchema,
  planRequestSchema,
} from "../validators/ai.validators";

const agentRoutes = Router();

agentRoutes.post(
  "/plan-itinerary",
  agentLimiter,
  validate(planRequestSchema),
  generateItinerary,
);

agentRoutes.post(
  "/compare",
  agentLimiter,
  validate(compareRequestSchema),
  compareDestinations,
);
export default agentRoutes;
