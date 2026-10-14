import {Router} from "express";
import { compareDestinations, generateItinerary } from "../controllers/agent.controller";


const agentRoutes = Router();

agentRoutes.post("/plan-itinerary", generateItinerary);

agentRoutes.post("/compare", compareDestinations)
export default agentRoutes;
