import { Router } from "express";
import { getCareers } from "../controllers/career.controller.js";

const router = Router();

router.get("/", getCareers);

export default router;