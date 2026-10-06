import { Router } from "express";
import {
  createContinent,
  deleteContinent,
  getAllContinents,
  getContinent,
  updateContinent,
} from "../controllers/continent.controller";

import { uploadSingle } from "../middleware/upload.middleware";

const router = Router();

router.get("/", getAllContinents);
router.get("/:slug", getContinent);

router.post("/", uploadSingle("image"), createContinent);

router.put("/:id", uploadSingle("image"), updateContinent);


router.delete("/:id", deleteContinent);

export const continentRoutes = router;
