import express from "express";
import skillRoutes from "./routes/skill.routes.js";

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

export default app;