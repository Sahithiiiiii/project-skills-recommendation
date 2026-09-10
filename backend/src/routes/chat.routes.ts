import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { sendChatMessage } from "../controllers/chat.controller.js";

const router = Router();

router.post("/", authenticate, sendChatMessage);

export default router;
