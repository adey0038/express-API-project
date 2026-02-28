import xss from "xss";
import userCache from "./cache.js";

class UserService {
  static async findByEmail(email) {
    return await userCache.findByEmail(email);
  }

  static async login(email, password) {
    return await userCache.login(email, password);
  }

  static async getAllUsers() {
    const users = await userCache.getAllUsers();
    return users.map(({ password, ...rest }) => rest);
  }

  static async getUser(id) {
    const user = await userCache.getUser(id);
    if (!user) return null;
    const { password, ...safe } = user;
    return safe;
  }

  static async addUser(data) {
    const user = {
      id: crypto.randomUUID(),
      firstName: xss(data.firstName),
      lastName: xss(data.lastName),
      email: xss(data.email),
      password: xss(data.password),
      count: 0,
    };
    return await userCache.addUser(user);
  }

  static async updateUser(id, data) {
    const updates = {};
    if (data.firstName) updates.firstName = xss(data.firstName);
    if (data.lastName) updates.lastName = xss(data.lastName);
    if (data.email) updates.email = xss(data.email);
    // password must NOT be updated here
    return await userCache.updateUser(id, updates);
  }

  static async deleteUser(id) {
    return await userCache.deleteUser(id);
  }

  static async resetPassword(id, oldPassword, newPassword) {
    return await userCache.resetPassword(id, oldPassword, newPassword);
  }
}

export default UserService;
