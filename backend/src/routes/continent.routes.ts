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

router.put("/:id", updateContinent);

router.delete("/:id", deleteContinent);

export const continentRoutes = router;
