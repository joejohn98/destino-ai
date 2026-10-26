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

router.get("/", getAllContinents);
router.get("/:slug", getContinent);

router.post(
  "/",
  uploadSingle("image"),
  protect,
  restrictTo("admin"),
  validate(createContinentSchema),
  createContinent,
);

router.put(
  "/:id",
  uploadSingle("image"),
  protect,
  restrictTo("admin"),
  validate(updateContinentSchema),
  updateContinent,
);

router.delete("/:id", protect, restrictTo("admin"), deleteContinent);

export const continentRoutes = router;
