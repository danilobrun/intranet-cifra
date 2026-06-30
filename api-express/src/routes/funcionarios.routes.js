const formidable = require("express-formidable");
const { checkToken } = require("../middleware/checktoken");
const {
  createFuncionarioController,
  exportFuncionariosCsvController,
  getFuncionarioController,
  importFuncionariosCsvController,
  inactivateFuncionarioController,
  listFuncionariosController,
  previewFuncionariosCsvImportController,
  updateFuncionarioController,
} = require("../presentation/controllers/funcionarios.controller");

const csvUploadMiddleware = formidable({
  maxFileSize: 2 * 1024 * 1024,
  multiples: false,
});

const funcionariosRoutes = (app) => {
  app.get("/funcionarios", checkToken, listFuncionariosController);
  app.get("/funcionarios/exportar", checkToken, exportFuncionariosCsvController);
  app.post(
    "/funcionarios/importar/preview",
    checkToken,
    csvUploadMiddleware,
    previewFuncionariosCsvImportController,
  );
  app.post(
    "/funcionarios/importar",
    checkToken,
    csvUploadMiddleware,
    importFuncionariosCsvController,
  );
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
