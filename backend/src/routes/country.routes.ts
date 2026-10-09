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

const countryRoutes = Router();
const continentCountryRoutes = Router({ mergeParams: true });

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
