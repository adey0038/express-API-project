import UserService from "../services/users.js";

class UserController {
  constructor() {
    this.controllerName = "UserController";
  }

  // Get All Users
  static async getAllUsers(req, res, next) {
    try {
      const results = await UserService.getAllUsers();
      res.status(200).json({ results });
    } catch (err) {
      next(err);
    }
  }

  // Validate Middleware
  static validateUser(req, res, next) {
    const neededFields = ["firstOne", "secondTwo"];
    switch (req.method) {
      case "PUT":
      case "PATCH":
        neededFields.push("alsoRequiredOne", "email", "id");
        break;

      case "POST":
        neededFields.push("alsoRequiredOne", "email", "password");
        break;

      default:
        neededFields.length = 0;
    }

    const fields = req.body;
    let valid = true;

    //check required fields
    for (const needed of neededFields) {
      if (!(needed in fields)) {
        valid = false;
        break;
      }
    }

    if (!valid) {
      return res.status(400).json({
        error: 400,
        message: `Missing required field for ${req.method} request`,
      });
    }

    // Validated Body
    req.validatedBody = {};
    for (const needed of neededFields) {
      req.validatedBody[needed] = req.body[needed];
    }
    next();
  }

  static async addUser(req, res, next) {
    try {
      const user = await UserService.addUser(req.validatedBody);
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  }
}

export default UserController;
