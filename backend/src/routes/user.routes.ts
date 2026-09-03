import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  addUserInterests,
  addUserSkills,
} from "../controllers/user.controller.js";

const router = Router();

router.post("/skills", authenticate, addUserSkills);
router.post("/interests", authenticate, addUserInterests);

router.get("/profile", authenticate, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "You are authenticated!",
    userId: req.userId,
  });
});

export default router;
