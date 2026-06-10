const { checkToken, ensureRoleCodes } = require("../middleware/checktoken");
const {
  getUserById,
  createUser,
  loginUser,
  listUsers,
  deleteUser,
  editUser,
  previewMyAvatar,
  updateMyAvatar,
  getMyAvatar,
  previewUserAvatar,
  updateUserAvatar,
  getUserAvatar,
  requestPasswordResetCode,
  verifyPasswordResetCode,
  resetUserPassword,
} = require("../presentation/controllers/users.controller");

const usersRoutes = (app) => {
  app.get("/users", checkToken, ensureRoleCodes(["1"]), listUsers);
  app.post("/users/me/avatar/preview", checkToken, previewMyAvatar);
  app.put("/users/me/avatar", checkToken, updateMyAvatar);
  app.get("/users/me/avatar", checkToken, getMyAvatar);
  app.post(
    "/users/:id/avatar/preview",
    checkToken,
    ensureRoleCodes(["1"]),
    previewUserAvatar,
  );
  app.put(
    "/users/:id/avatar",
    checkToken,
    ensureRoleCodes(["1"]),
    updateUserAvatar,
  );
  app.get("/users/:id/avatar", checkToken, getUserAvatar);
  app.get("/user/:id", checkToken, getUserById);
  app.post("/auth/register", createUser);
  app.post("/auth/login/", loginUser);
  app.post("/auth/forgot-password/request", requestPasswordResetCode);
  app.post("/auth/forgot-password/verify", verifyPasswordResetCode);
  app.post("/auth/forgot-password/reset", resetUserPassword);
  app.delete("/user/:id", checkToken, ensureRoleCodes(["1"]), deleteUser);
  app.put("/user/:id", checkToken, ensureRoleCodes(["1"]), editUser);
};

module.exports = usersRoutes;
