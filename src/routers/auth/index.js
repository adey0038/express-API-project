import jwt from "jsonwebtoken";
import xss from "xss";
import UserService from "./../../services/users.js";

class UserAuth {
  // Authorization
  static authorize(req, res, next) {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(498).json({ error: "Bad or missing token" });
    }

    const token = header.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.id;
      next();
    } catch (err) {
      return res.status(498).json({ error: "Bad or missing token" });
    }
  }

  // POST /api/auth/signup
  static async signup(req, res) {
    // console.log("Body received", req.body);
    try {
      const { firstName, lastName, email, password } = req.body || {};

      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ error: "Invalid submission" });
      }

      // sanitize
      const cleanUser = {
        firstName: xss(firstName),
        lastName: xss(lastName),
        email: xss(email),
        password: xss(password),
      };

      // check duplicate email
      const existing = await UserService.findByEmail(cleanUser.email);
      if (existing) {
        return res.status(409).json({ error: "Email already exists" });
      }

      const newUser = await UserService.addUser(cleanUser);

      return res.status(201).json({
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        count: newUser.count,
      });
    } catch (err) {
      //   console.error("Signup Error", err);
      return res.status(400).json({ error: "Invalid submission" });
    }
  }

  // POST /api/auth/login
  static async login(req, res) {
    try {
      const { email, password } = req.body || {};

      if (!email || !password) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const user = await UserService.login(email, password);

      //   console.log("Found user", user);
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      // cookie
      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });

      const { password: pw, ...safeUser } = user;

      return res.status(200).json({ message: "Successful Login", token });
    } catch (err) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
  }

  // GET /api/auth/me
  static async me(req, res) {
    try {
      const user = await UserService.getUser(req.userId);
      if (!user) {
        return res.status(498).json({ error: "Bad or missing token" });
      }
      return res.status(200).json(user);
    } catch (err) {
      return res.status(498).json({ error: "Bad or missing token" });
    }
  }

  // POST /api/auth/reset
  static async reset(req, res) {
    try {
      const userId = req.userId;
      const { oldPassword, newPassword } = req.body || {};

      if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: "Missing input" });
      }

      const updated = await UserService.resetPassword(
        userId,
        xss(oldPassword),
        xss(newPassword),
      );

      if (!updated) {
        return res.status(400).json({
          error: "No match for id and old password",
        });
      }

      return res.status(200).json({ message: "Password updated" });
    } catch (err) {
      return res.status(400).json({
        error: "Missing input or no match for id and old password",
      });
    }
  }
}

export default UserAuth;
