import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
	getCareerDetails,
	getCareers,
	getCareerRoadmap,
} from "../controllers/career.controller.js";

const router = Router();

router.get("/", getCareers);
router.get("/:careerId/roadmap", authenticate, getCareerRoadmap);
router.get("/:careerId", authenticate, getCareerDetails);

export default router;