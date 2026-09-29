import { Router } from "express";
import {
  searchDestinations,
  getDestinationsByLocation,
  getDestinationsByRating,
  getDestinationsByMinRating,
  getDestinationsByCategory,
  getContinentStats,
} from "../controllers/destination.controller";

const router = Router();

router.get("/search", searchDestinations);
router.get("/location/:location", getDestinationsByLocation);
router.get("/rating", getDestinationsByRating);
router.get("/filter/:minRating", getDestinationsByMinRating);
router.get("/category/:category", getDestinationsByCategory);
router.get("/stats/continents", getContinentStats);

export default router;
