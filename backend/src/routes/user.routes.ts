import { Router } from "express";

import {
  addFavorite,
  deleteProfile,
  getFavorites,
  getProfile,
  removeFavorite,
  updateProfile,
} from "../controllers/user.controller";
import { protect } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { updateProfileSchema } from "../validators/user.validators";

const userRoutes = Router();

userRoutes.use(protect);

userRoutes.get("/profile", getProfile);
userRoutes.patch("/profile", validate(updateProfileSchema), updateProfile);
userRoutes.delete("/profile", deleteProfile);

userRoutes.get("/favorites", getFavorites);
userRoutes.post("/favorites/:destinationId", addFavorite);
userRoutes.delete("/favorites/:destinationId", removeFavorite);

export { userRoutes };
