import { createClient } from "redis";
import { users } from "../models/users.js";

class UserCache {
  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL,
    });

    this.client.on("error", (err) =>
      console.error("Redis error:", err.message),
    );
  }

  async connect() {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  // Get all users (no caching)
  async getAllUsers() {
    return users;
  }

  // Get user by id from the cache
  async getUser(id) {
    await this.connect();

    const key = `user:${id}`;
    const cached = await this.client.get(key);

    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        await this.client.del(key);
      }
    }

    const user = users.find((u) => u.id === id);
    if (user) {
      await this.client.set(key, JSON.stringify(user));
    }

    return user || null;
  }

  async findByEmail(email) {
    return users.find((u) => u.email === email) || null;
  }

  // Add user
  async addUser(user) {
    await this.connect();

    users.push(user);
    await this.client.set(`user:${user.id}`, JSON.stringify(user));

    return user;
  }

  // Update user
  async updateUser(id, data) {
    await this.connect();

    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return null;

    users[index] = { ...users[index], ...data };

    await this.client.set(`user:${id}`, JSON.stringify(users[index]));

    return users[index];
  }

  // Delete user
  async deleteUser(id) {
    await this.connect();

    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return false;

    users.splice(index, 1);
    await this.client.del(`user:${id}`);

    return true;
  }

  // Reset password
  async resetPassword(id, oldPassword, newPassword) {
    await this.connect();

    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return null;

    const user = users[index];

    if (user.password !== oldPassword) {
      return null;
    }

    user.password = newPassword;

    await this.client.set(`user:${id}`, JSON.stringify(user));

    return user;
  }

  // Login
  async login(email, password) {
    return (
      users.find((u) => u.email === email && u.password === password) || null
    );
  }
}

const userCache = new UserCache();
await userCache.connect();
export default userCache;
