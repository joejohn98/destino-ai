import {Router} from "express";
import { generateItinerary } from "../controllers/agent.controller";


const agentRoutes = Router();

agentRoutes.post("/plan-itinerary", generateItinerary);

export default agentRoutes;
