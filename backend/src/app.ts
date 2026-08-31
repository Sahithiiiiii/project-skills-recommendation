import express from "express";
import skillRoutes from "./routes/skill.routes.js";
import careerRoutes from "./routes/career.routes.js";
const app = express();

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
export default app;