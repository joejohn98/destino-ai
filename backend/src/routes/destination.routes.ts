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
  createDestination,
  updateDestination,
  deleteDestination,
} from "../controllers/destination.controller";
import { protect, restrictTo } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import {
  createDestinationSchema,
  updateDestinationSchema,
} from "../validators/destination.validators";
import { uploadArray } from "../middleware/upload.middleware";

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
router.post(
  "/",
  protect,
  restrictTo("admin"),
  uploadArray("images", 5),
  validate(createDestinationSchema),
  createDestination
);

router.get("/:name", getDestinationByName);
router.put(
  "/:id",
  protect,
  restrictTo("admin"),
  uploadArray("images", 5),
  validate(updateDestinationSchema),
  updateDestination
);
router.delete(
  "/:id",
  protect,
  restrictTo("admin"),
  deleteDestination
);

export default router;
