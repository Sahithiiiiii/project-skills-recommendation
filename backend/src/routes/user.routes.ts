import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  addUserInterests,
  addUserSkills,
  getUserProfile,
  updateUserInterests,
  updateUserSkills,
} from "../controllers/user.controller.js";

const router = Router();

router.post("/skills", authenticate, addUserSkills);
router.post("/interests", authenticate, addUserInterests);
router.put("/skills", authenticate, updateUserSkills);
router.put("/interests", authenticate, updateUserInterests);

router.get("/profile", authenticate, getUserProfile);

export default router;
