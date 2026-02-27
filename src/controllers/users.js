import UserService from "../services/users.js";

class UserController {
  static sanitizeUser(user) {
    if (!user) return null;
    const { password, ...safe } = user;
    return safe;
  }

  // GET /api/users
  static async getAllUsers(req, res) {
    try {
      const users = await UserService.getAllUsers();
      return res.status(200).json(users.map(UserController.sanitizeUser));
    } catch (err) {
      return res
        .status(400)
        .json({ error: 400, message: "Unable to get user list" });
    }
  }

  // GET /api/users/:id
  static async getUser(req, res) {
    try {
      const user = await UserService.getUser(req.params.id);
      if (!user) {
        return res
          .status(400)
          .json({ error: 400, message: "Unable to get user" });
      }
      return res.status(200).json(UserController.sanitizeUser(user));
    } catch (err) {
      return res
        .status(400)
        .json({ error: 400, message: "Unable to get user" });
    }
  }

  // POST /api/user
  static async addUser(req, res) {
    try {
      const user = await UserService.addUser(req.body);
      if (!user) {
        return res
          .status(418)
          .json({ error: 418, message: "Failed to add user" });
      }
      return res.status(201).json(UserController.sanitizeUser(user));
    } catch (err) {
      return res
        .status(418)
        .json({ error: 418, message: "Failed to add user" });
    }
  }

  // PUT /api/user/:id
  static async updateUser(req, res) {
    try {
      const updated = await UserService.updateUser(req.params.id, req.body);
      if (!updated) {
        return res
          .status(400)
          .json({ error: 400, message: "Failed to edit user" });
      }
      return res.status(200).json(UserController.sanitizeUser(updated));
    } catch (err) {
      return res
        .status(400)
        .json({ error: 400, message: "Failed to edit user" });
    }
  }

  // DELETE /api/user/:id
  static async deleteUser(req, res) {
    try {
      if (req.userId === req.params.id) {
        return res
          .status(400)
          .json({ error: 400, message: "cannot delete yourself" });
      }

      const deleted = await UserService.deleteUser(req.params.id);
      if (!deleted) {
        return res
          .status(400)
          .json({ error: 400, message: "error while deleting user" });
      }

      return res.status(204).send();
    } catch (err) {
      return res
        .status(400)
        .json({ error: 400, message: "error while deleting user" });
    }
  }
}

export default UserController;
