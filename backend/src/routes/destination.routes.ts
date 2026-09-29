import { Router } from "express";
import {
  searchDestinations,
  getDestinationsByLocation,
} from "../controllers/destination.controller";

const router = Router();

router.get("/search", searchDestinations);
router.get("/location/:location", getDestinationsByLocation);

export default router;
