import jwt from "jsonwebtoken";
import userCache from "../services/cache.js";

class UserAuth {
  // Signup a new user
  static async signup(req, res) {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password || !firstName || !lastName) {
        return res
          .status(400)
          .json({ error: 400, message: "Invalid submission" });
      }

      // Check if email already exists
      const allUsers = await userCache.getAllUsers();
      if (allUsers.some((u) => u.email === email)) {
        return res
          .status(409)
          .json({ error: 409, message: "Email already exists" });
      }

      const newUser = {
        id: crypto.randomUUID(),
        email,
        password,
        firstName,
        lastName,
        count: 0,
      };

      const user = await userCache.addUser(newUser);
      return res.status(201).json(user);
    } catch (err) {
      console.error(err);
      return res
        .status(418)
        .json({ error: 418, message: "Failed to add user" });
    }
  }

  // Login - verify email/password, return JWT in cookie + JSON
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res
          .status(401)
          .json({ error: 401, message: "Missing credentials" });
      }

      const user = await userCache.getAllUsers();
      const found = user.find(
        (u) => u.email === email && u.password === password,
      );

      if (!found)
        return res
          .status(401)
          .json({ error: 401, message: "Invalid email or password" });

      const token = jwt.sign(
        { id: found.id, email: found.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" },
      );

      // Set JWT in cookie and return user info (without password)
      res.cookie("token", token, { httpOnly: true, secure: true });
      return res
        .status(200)
        .json({ token, user: userCache.sanitizeUser(found) });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 500, message: "Server error" });
    }
  }

  // Me - return logged-in user info
  static async me(req, res) {
    try {
      const { id } = req.user; // set by authorize middleware
      const user = await userCache.getUser(id);
      if (!user)
        return res.status(400).json({ error: 400, message: "User not found" });

      return res.status(200).json(user);
    } catch (err) {
      console.error(err);
      return res
        .status(498)
        .json({ error: 498, message: "Bad or missing token" });
    }
  }

  // Reset password
  static async reset(req, res) {
    try {
      const { oldPassword, newPassword } = req.body;
      const { id } = req.user; // set by authorize middleware

      if (!oldPassword || !newPassword) {
        return res
          .status(400)
          .json({ error: 400, message: "Missing parameters" });
      }

      const success = await userCache.resetPassword(
        id,
        oldPassword,
        newPassword,
      );
      if (!success) {
        return res
          .status(400)
          .json({ error: 400, message: "Old password does not match" });
      }

      return res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 500, message: "Server error" });
    }
  }

  // Middleware to verify JWT from header
  static authorize(req, res, next) {
    const authHeader = req.get("Authorization");
    if (!authHeader)
      return res
        .status(498)
        .json({ error: 498, message: "Missing Authorization header" });

    const token = authHeader.replace(/^bearer\s/i, "");
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      return res
        .status(498)
        .json({ error: 498, message: "Invalid or expired token" });
    }
  }
}

export default UserAuth;
