import xss from "xss";
import userCache from "./cache.js";

class UserService {
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
      name: xss(data.name),
      email: xss(data.email),
      password: xss(data.password),
    };
    return await userCache.addUser(user);
  }

  static async updateUser(id, data) {
    const updates = {};
    if (data.name) updates.name = xss(data.name);
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
