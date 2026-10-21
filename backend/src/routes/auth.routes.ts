import { Router } from "express";
import { register, login, logout } from "../controllers/auth.controller";
import { authLimiter } from "../middleware/ratelimit.middleware";
import { validate } from "../middleware/validation.middleware";
import { loginSchema, registerSchema } from "../validators/auth.validators";

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/logout", logout);

export const authRoutes = router;

