import { Router } from "express";
import {
  compareDestinations,
  generateItinerary,
} from "../controllers/agent.controller";
import { protect } from "../middleware/auth.middleware";
import { agentLimiter } from "../middleware/ratelimit.middleware";
import { validate } from "../middleware/validation.middleware";
import {
  compareRequestSchema,
  planRequestSchema,
} from "../validators/ai.validators";

const agentRoutes = Router();

// Protect all AI agent endpoints so only authenticated users can trigger planner & comparison generations.
agentRoutes.use(protect);

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
