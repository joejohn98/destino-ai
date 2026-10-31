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
import { protect, restrictTo } from "../middleware/auth.middleware";

const router = Router();

// Every route in this namespace operates on data and is admin-only.
// The dashboard relies on this being enforced before any handler runs.
router.use(protect, restrictTo("admin"));

router.get("/", getAllContinents);
router.get("/:slug", getContinent);

router.post(
  "/",
  uploadSingle("image"),
  validate(createContinentSchema),
  createContinent,
);

router.put(
  "/:id",
  uploadSingle("image"),
  validate(updateContinentSchema),
  updateContinent,
);

router.delete("/:id", deleteContinent);

export const continentRoutes = router;
