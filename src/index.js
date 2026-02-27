import express from "express";
import cors from "cors";

import usersRouter from "./routers/users.js";
import UserAuth from "./services/auth.js";

import dotenv from "dotenv";

dotenv.config({ path: File, debug: true, encoding: "utf-8" });
const app = express();

app.use(cors());
app.use(express.json());

// Public auth routes
app.post("/api/auth/signup", UserAuth.signup);
app.post("/api/auth/login", UserAuth.login);
app.get("/api/auth/me", UserAuth.authorize, UserAuth.me);
app.post("/api/auth/reset", UserAuth.authorize, UserAuth.reset);

// User CRUD routes
app.use("/api/users", usersRouter);

// Default endpoints
app.get("/", (req, res) => {
  res.status(200);
});
app.get("/api", (req, res) => {
  res.status(200);
});

// 404 handler for other endpoints
app.use((req, res) =>
  res.status(404).json({ error: 404, message: "Endpoint not found" }),
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, (err) => {
  if (err) {
    console.log("Unable to launch", err.message);
    return;
  }
  console.log(`Server running on port ${PORT}`);
});
