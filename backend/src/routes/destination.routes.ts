import { Router } from "express";
import {
  searchDestinations,
  getDestinationsByRating,
  getDestinationsByLocation,
  getDestinationsByMinRating,
  getDestinationsByCategory,
  getContinentStats,
  getCountriesByContinent,
  getPaginatedDestinations,
  getDestinationByName,
} from "../controllers/destination.controller";

const router = Router();

// CRITICAL: Express matches top-to-bottom. Static and specific routes MUST precede wildcard /:name.
router.get("/search", searchDestinations);
router.get("/rating", getDestinationsByRating);
router.get("/location/:location", getDestinationsByLocation);
router.get("/filter/:minRating", getDestinationsByMinRating);
router.get("/category/:category", getDestinationsByCategory);
router.get("/continents", getContinentStats);
router.get("/continents/:continent/countries", getCountriesByContinent);
router.get("/", getPaginatedDestinations);
router.get("/:name", getDestinationByName);

export default router;
