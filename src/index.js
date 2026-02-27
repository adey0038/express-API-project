import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "node:path";
import winston from "winston";

const dir = process.cwd(); //our current project folder
const file = path.resolve(dir, ".env");
dotenv.config({ path: file, debug: true, encoding: "utf-8" });

import usersRouter from "./routers/users.js";
import UserAuth from "./routers/auth/index.js";

const app = express();

// Winston logger initialization
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(dir, "logs/error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(dir, "logs/combined.log"),
    }),
  ],
});
// Log to console in development
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({ format: winston.format.simple() }),
  );
}

// Middleware
app.use(cors());
app.use(express.json());

// Log every request
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

//Serve static files in public folder
app.use(express.static(path.join(dir, "public")));

// Public auth routes
app.post("/api/auth/signup", UserAuth.signup);
app.post("/api/auth/login", UserAuth.login);
app.get("/api/auth/me", UserAuth.authorize, UserAuth.me);
app.post("/api/auth/reset", UserAuth.authorize, UserAuth.reset);

// User CRUD routes
app.use("/api/users", usersRouter);

// Default endpoints
app.get("/", (req, res) => {
  res.status(200).send("API Currently Online");
});
app.get("/api", (req, res) => {
  res.status(200).json({
    message: "User API endpoints",
    html: "/public/endpoints.html",
  });
});

// Error handling for logging middleware
app.use((err, req, res, next) => {
  logger.error(err.message);
  res.status(500).json({ error: 500, message: "Internal server error" });
});

// 404 handler for other endpoints
app.use((req, res) =>
  res.status(404).json({ error: 404, message: "Endpoint not found" }),
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, (err) => {
  if (err) {
    logger.error("Unable to launch", err.message);
    return;
  }
  logger.info(`Server running on port ${PORT}`);
});
