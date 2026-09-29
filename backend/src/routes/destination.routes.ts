import { Router } from "express";
import { searchDestinations } from "../controllers/destination.controller";

const router = Router();

router.get("/search", searchDestinations);

export default router;
