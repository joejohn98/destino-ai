import {Router} from "express";
import {
    createCountry,
    deleteCountry,
    getAllCountries,
    getCountry,
    updateCountry,
} from "../controllers/country.controller";

const router = Router();

router.get("/", getAllCountries);

router.get("/:slug", getCountry);

router.post("/", createCountry);

router.put("/:id", updateCountry);

router.delete("/:id", deleteCountry);

export const countryRoutes = router;