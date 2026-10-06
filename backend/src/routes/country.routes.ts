import {Router} from "express";
import {
    createCountry,
    deleteCountry,
    getAllCountries,
    getCountry,
    updateCountry,
} from "../controllers/country.controller";

import { uploadSingle } from "../middleware/upload.middleware";

const router = Router();

router.get("/", getAllCountries);

router.get("/:slug", getCountry);

router.post("/", uploadSingle("image"), createCountry);

router.put("/:id", uploadSingle("image"), updateCountry);


router.delete("/:id", deleteCountry);

export const countryRoutes = router;