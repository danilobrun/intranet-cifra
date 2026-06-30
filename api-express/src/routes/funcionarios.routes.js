const { checkToken } = require("../middleware/checktoken");
const {
  createFuncionarioController,
  getFuncionarioController,
  inactivateFuncionarioController,
  listFuncionariosController,
  updateFuncionarioController,
} = require("../presentation/controllers/funcionarios.controller");

const funcionariosRoutes = (app) => {
  app.get("/funcionarios", checkToken, listFuncionariosController);
  app.get("/funcionarios/:id", checkToken, getFuncionarioController);
  app.post("/funcionarios", checkToken, createFuncionarioController);
  app.patch(
    "/funcionarios/:id/inativar",
    checkToken,
    inactivateFuncionarioController,
  );
  app.put("/funcionarios/:id", checkToken, updateFuncionarioController);
  app.patch("/funcionarios/:id", checkToken, updateFuncionarioController);
};

module.exports = funcionariosRoutes;
