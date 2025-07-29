"use strict";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { serve } from "inngest/express";
import { errorHandler } from "./middleware/errorHandler";
import { logger } from "./utils/logger";
import authRoutes from "./routes/auth";
import chatRoutes from "./routes/chat";
import moodRoutes from "./routes/mood";
import activityRoutes from "./routes/activity";
import { connectDB } from "./utils/db";
import { inngest } from "./inngest/client";
import { functions } from "./inngest/functions";

// Load environment variables from .env file
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(helmet());             // Security headers
app.use(cors());               // Enable CORS
app.use(express.json());       // Parse JSON bodies
app.use(morgan("dev"));        // HTTP request logging

// Root route - Friendly message to confirm API is running
app.get("/", (req, res) => {
  res.send("API is running!");
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Inngest endpoint setup
app.use("/api/inngest", serve({ client: inngest, functions }));

// App routes
app.use("/auth", authRoutes);
app.use("/chat", chatRoutes);
app.use("/api/mood", moodRoutes);
app.use("/api/activity", activityRoutes);

// Error handling middleware (must come after all routes)
app.use(errorHandler);

// Start the server after connecting to MongoDB
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Inngest endpoint available at http://localhost:${PORT}/api/inngest`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
