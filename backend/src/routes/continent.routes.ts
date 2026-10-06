import { Router } from "express";
import {
  createContinent,
  deleteContinent,
  getAllContinents,
  getContinent,
  updateContinent,
} from "../controllers/continent.controller";

const router = Router();

router.get("/", getAllContinents);
router.get("/:slug", getContinent);

router.post("/", createContinent);

router.put("/:slug", updateContinent);

router.delete("/:slug", deleteContinent);

export const continentRoutes = router;
