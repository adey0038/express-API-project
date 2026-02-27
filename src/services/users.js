import userCache from "./cache.js";

class UserService {
  static async getAllUsers() {
    return await userCache.getAllUsers();
  }

  static async getUser(id) {
    return await userCache.getUser(id);
  }

  static async addUser(user) {
    return await userCache.addUser(user);
  }

  static async updateUser(id, data) {
    return await userCache.updateUser(id, data);
  }

  static async deleteUser(id) {
    return await userCache.deleteUser(id);
  }

  static async resetPassword(id, oldPassword, newPassword) {
    return await userCache.resetPassword(id, oldPassword, newPassword);
  }
}

export default UserService;
