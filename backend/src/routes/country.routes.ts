import { Router } from "express";
import {
    createCountry,
    deleteCountry,
    getAllCountries,
    getCountry,
    updateCountry,
} from "../controllers/country.controller";

import { uploadSingle } from "../middleware/upload.middleware";

const countryRoutes = Router();
const continentCountryRoutes = Router({ mergeParams: true });

continentCountryRoutes.get("/", getAllCountries);

continentCountryRoutes.get("/:slug", getCountry);

continentCountryRoutes.post("/", uploadSingle("image"), createCountry);

countryRoutes.put("/:id", uploadSingle("image"), updateCountry);

countryRoutes.delete("/:id", deleteCountry);

export { countryRoutes, continentCountryRoutes };
