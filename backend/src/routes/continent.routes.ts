import { Router } from "express";
import {
  createContinent,
  deleteContinent,
  getAllContinents,
  getContinent,
  updateContinent,
} from "../controllers/continent.controller";

import { uploadSingle } from "../middleware/upload.middleware";
import { validate } from "../middleware/validation.middleware";
import {
  createContinentSchema,
  updateContinentSchema,
} from "../validators/continent.validators";

const router = Router();

router.get("/", getAllContinents);
router.get("/:slug", getContinent);

router.post("/", uploadSingle("image"), validate(createContinentSchema), createContinent);

router.put("/:id", uploadSingle("image"), validate(updateContinentSchema), updateContinent);


router.delete("/:id", deleteContinent);

export const continentRoutes = router;
