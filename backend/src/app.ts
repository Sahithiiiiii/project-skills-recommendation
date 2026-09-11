import express from "express";
import cors from "cors";
import skillRoutes from "./routes/skill.routes.js";
import careerRoutes from "./routes/career.routes.js";
import recommendationRoutes from "./routes/recommendation.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import chatRoutes from "./routes/chat.routes.js";
const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "PathForge API is running 🚀",
  });
});

// Skills API
app.use("/api/skills", skillRoutes);
app.use("/api/careers", careerRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
export default app;