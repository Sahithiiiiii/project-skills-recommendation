import { Router } from "express";
import { getRecommendations } from "../controllers/recommendation.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authenticate, getRecommendations);

export default router;