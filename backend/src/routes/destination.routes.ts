import { Router } from "express";
import {
  searchDestinations,
  getDestinationsByLocation,
  getDestinationsByRating,
  getDestinationsByMinRating,
} from "../controllers/destination.controller";

const router = Router();

router.get("/search", searchDestinations);
router.get("/location/:location", getDestinationsByLocation);
router.get("/rating", getDestinationsByRating);
router.get("/filter/:minRating", getDestinationsByMinRating);

export default router;
