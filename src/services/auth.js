import jwt from "jsonwebtoken";
import { users } from "../models/users.js";

const JWT_SECRET = process.env.JWT_SECRET;

// Create a JWT token
export function signToken(user) {
  return jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });
}

// Verify a JWT token
export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

// Find a user by email
export function findUserByEmail(email) {
  return users.find((u) => u.email === email);
}

// Find a user by id
export function findUserById(id) {
  return users.find((u) => u.id === id);
}
