import { Router } from "express";
import {
    createContinent,
  getAllContinents,
  getContinent,
} from "../controllers/continent.controller";

const router = Router();


router.get("/", getAllContinents);
router.get("/:slug", getContinent);


router.post("/", createContinent);

export const continentRoutes = router;
