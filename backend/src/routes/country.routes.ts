import { Router } from "express";
import {
  createCountry,
  deleteCountry,
  getAllCountries,
  getCountry,
  updateCountry,
} from "../controllers/country.controller";

import { uploadSingle } from "../middleware/upload.middleware";
import { validate } from "../middleware/validation.middleware";
import {
  createCountrySchema,
  updateCountrySchema,
} from "../validators/country.validators";
import { protect, restrictTo } from "../middleware/auth.middleware";

const countryRoutes = Router();
const continentCountryRoutes = Router({ mergeParams: true });

// Every route in this namespace operates on data and is admin-only.
// The dashboard relies on this being enforced before any handler runs.
continentCountryRoutes.use(protect, restrictTo("admin"));
countryRoutes.use(protect, restrictTo("admin"));

continentCountryRoutes.get("/", getAllCountries);
continentCountryRoutes.get("/:slug", getCountry);

continentCountryRoutes.post(
  "/",
  uploadSingle("image"),
  validate(createCountrySchema),
  createCountry,
);

countryRoutes.put(
  "/:id",
  uploadSingle("image"),
  validate(updateCountrySchema),
  updateCountry,
);

countryRoutes.delete("/:id", deleteCountry);

export { countryRoutes, continentCountryRoutes };
