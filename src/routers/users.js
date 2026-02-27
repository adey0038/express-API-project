import { Router } from "express";
import UserController from "../controllers/users.js";
import UserAuth from "../routers/auth/index.js";

const userRouter = Router();

// All user routes require JWT authorization
userRouter.use(UserAuth.authorize);

// GET /api/users
userRouter.get("/", UserController.getAllUsers);

// GET /api/users/:id
userRouter.get("/:id", UserController.getUser);

// POST /api/users
userRouter.post("/", UserController.addUser);

// PUT /api/users/:id
userRouter.put("/:id", UserController.updateUser);

// DELETE /api/users/:id
userRouter.delete("/:id", UserController.deleteUser);

export default userRouter;
