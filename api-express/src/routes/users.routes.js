const { checkToken } = require("../middleware/checktoken");
const {
  getUserById,
  createUser,
  loginUser,
  listUsers,
  deleteUser,
  editUser,
  requestPasswordResetCode,
  verifyPasswordResetCode,
  resetUserPassword,
} = require("../presentation/controllers/users.controller");

const usersRoutes = (app) => {
  app.get("/users", listUsers);
  app.get("/user/:id", checkToken, getUserById);
  app.post("/auth/register", createUser);
  app.post("/auth/login/", loginUser);
  app.post("/auth/forgot-password/request", requestPasswordResetCode);
  app.post("/auth/forgot-password/verify", verifyPasswordResetCode);
  app.post("/auth/forgot-password/reset", resetUserPassword);
  app.delete("/user/:id", deleteUser);
  app.put("/user/:id", checkToken, editUser);
};

module.exports = usersRoutes;
