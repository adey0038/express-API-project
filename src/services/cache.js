import { createClient } from "redis";
import { users } from "./../models/users.js";

const log = console.log;

class UserCache {
  constructor() {
    this.client = createClient({ url: process.env.REDIS_URL });
    this.client.on("error", (err) => {
      log("Redis connection error", err.message);
    });
  }

  async connect() {
    await this.client.connect();
    log("Redis connected");
  }

  // Remove password before sending user data
  sanitizeUser(user) {
    if (!user) return null;
    const { password, ...safe } = user;
    return safe;
  }

  // Get all users (no caching)
  async getAllUsers() {
    return users.map((u) => this.sanitizeUser(u));
  }

  // Get a single user ( check cache first)
  async getUser(id) {
    const cachedUser = await this.client.get(id);

    if (cachedUser) {
      return this.sanitizeUser(JSON.parse(cachedUser));
    }

    const user = users.find((u) => u.id === id);
    if (user) {
      await this.client.set(id, JSON.stringify(user));
    }
    return this.sanitizeUser(user);
  }

  // Add a new user
  async addUser(user) {
    users.push(user);
    await this.client.set(user.id, JSON.stringify(user));
    return this.sanitizeUser(user);
  }

  // Update an existing user
  async updateUser(id, data) {
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return null;
    users[index] = { ...users[index], ...data };
    await this.client.set(id, JSON.stringify(users[index]));
    return this.sanitizeUser(users[index]);
  }

  // Delete a user
  async deleteUser(id) {
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) {
      log("User not found");
    }

    users.splice(index, 1);
    await this.client.del(id);
    return true;
  }

  // Reset password for a user
  async resetPassword(id, oldPassword, newPassword) {
    const user = users.find((u) => u.id === id);
    if (!user) {
      log("Provide a valid id");
    }
    if (user.password !== oldPassword) {
      log("Provide old password to reset password");
    }
    user.password = newPassword;
    await this.client.set(id, JSON.stringify(user));
    return true;
  }
}
const userCache = new UserCache();
export default userCache;
