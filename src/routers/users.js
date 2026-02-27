import { Router } from "express";
import UserController from "./../controllers/users.js";
import UserAuth from "./../services/auth.js";

const router = Router();

// All user routes require JWT authorization
router.use(UserAuth.authorize);

router.get("/", UserController.getAllUsers);
router.get("/:id", UserController.getUser);
router.post("/", UserController.addUser);
router.put("/:id", UserController.updateUser);
router.delete("/:id", UserController.deleteUser);

export default router;
