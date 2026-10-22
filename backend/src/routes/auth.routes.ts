import { Router } from "express";
import { register, login, logout } from "../controllers/auth.controller";
import { authLimiter } from "../middleware/ratelimit.middleware";
import { validate } from "../middleware/validation.middleware";
import { loginSchema, registerSchema } from "../validators/auth.validators";

import passport from "../config/passport";
import { createSendToken } from "../utils/utils";
import { IUser } from "../models/User.model";
import { config } from "../config/config";

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/logout", logout);

// --- Google OAuth ---
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${config.clientUrl}/login?error=oauth_failed`,
  }),
  (req, res) => {
    const user = req.user as IUser;
    createSendToken(user, res);
    res.redirect(`${config.clientUrl}/oauth-success`);
  },
);

// --- GitHub OAuth ---
router.get(
  "/github",
  passport.authenticate("github", {
    scope: ["user:email"],
    session: false,
  }),
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: `${config.clientUrl}/login?error=oauth_failed`,
  }),
  (req, res) => {
    const user = req.user as IUser;
    createSendToken(user, res);
    res.redirect(`${config.clientUrl}/oauth-success`);
  },
);

export const authRoutes = router;

