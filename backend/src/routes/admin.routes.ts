import { Router } from "express";
import { protect, restrictTo } from "../middleware/auth.middleware";
import { flushCacheHandler } from "../controllers/admin.controller";

const router = Router();

// Require admin authentication for all admin endpoints
router.use(protect, restrictTo("admin"));

// POST /api/admin/cache/flush
router.post("/cache/flush", flushCacheHandler);

export const adminRoutes = router;
