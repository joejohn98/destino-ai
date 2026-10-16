import { Router } from "express";
import {
  compareDestinations,
  generateItinerary,
} from "../controllers/agent.controller";
import { validate } from "../middleware/validation.middleware";
import {
  compareRequestSchema,
  planRequestSchema,
} from "../validators/ai.validators";

const agentRoutes = Router();

agentRoutes.post(
  "/plan-itinerary",
  validate(planRequestSchema),
  generateItinerary,
);

agentRoutes.post(
  "/compare",
  validate(compareRequestSchema),
  compareDestinations,
);
export default agentRoutes;
