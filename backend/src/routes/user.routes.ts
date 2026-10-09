import { Router } from "express";

import {
  deleteProfile,
  getProfile,
  updateProfile,
} from "../controllers/user.controller";
import { protect } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { updateProfileSchema } from "../validators/user.validators";

const userRoutes = Router();

userRoutes.use(protect);

userRoutes
  .route("/profile")
  .get(getProfile)
  .put(validate(updateProfileSchema), updateProfile)
  .delete(deleteProfile);

export { userRoutes };
