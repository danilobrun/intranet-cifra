const formidable = require("express-formidable");
const { checkToken, ensureRoleCodes } = require("../middleware/checktoken");
const {
  createFuncionarioController,
  exportFuncionariosCsvController,
  getFuncionarioController,
  importFuncionariosCsvController,
  inactivateFuncionarioController,
  listCentrosCustoFuncionariosController,
  listFuncionariosController,
  previewFuncionariosCsvImportController,
  updateFuncionarioController,
} = require("../presentation/controllers/funcionarios.controller");

const csvUploadMiddleware = formidable({
  maxFileSize: 2 * 1024 * 1024,
  multiples: false,
});

const CENTRO_CUSTO_MANAGEMENT_ROLES = ["1", "admin", "rh"];
const CENTRO_CUSTO_OPERATION_ROLES = [
  ...CENTRO_CUSTO_MANAGEMENT_ROLES,
  "obras",
  "2-6",
];

const ensureCentroCustoManagementRole = ensureRoleCodes(
  CENTRO_CUSTO_MANAGEMENT_ROLES,
);
const ensureCentroCustoOperationRole = ensureRoleCodes(
  CENTRO_CUSTO_OPERATION_ROLES,
);

const funcionariosRoutes = (app) => {
  app.get(
    "/funcionarios",
    checkToken,
    ensureCentroCustoOperationRole,
    listFuncionariosController,
  );
  app.get(
    "/funcionarios/exportar",
    checkToken,
    ensureCentroCustoManagementRole,
    exportFuncionariosCsvController,
  );
  app.get(
    "/funcionarios/centros-custo",
    checkToken,
    ensureCentroCustoOperationRole,
    listCentrosCustoFuncionariosController,
  );
  app.post(
    "/funcionarios/importar/preview",
    checkToken,
    ensureCentroCustoManagementRole,
    csvUploadMiddleware,
    previewFuncionariosCsvImportController,
  );
  app.post(
    "/funcionarios/importar",
    checkToken,
    ensureCentroCustoManagementRole,
    csvUploadMiddleware,
    importFuncionariosCsvController,
  );
  app.get(
    "/funcionarios/:id",
    checkToken,
    ensureCentroCustoManagementRole,
    getFuncionarioController,
  );
  app.post(
    "/funcionarios",
    checkToken,
    ensureCentroCustoManagementRole,
    createFuncionarioController,
  );
  app.patch(
    "/funcionarios/:id/inativar",
    checkToken,
    ensureCentroCustoManagementRole,
    inactivateFuncionarioController,
  );
  app.put(
    "/funcionarios/:id",
    checkToken,
    ensureCentroCustoManagementRole,
    updateFuncionarioController,
  );
  app.patch(
    "/funcionarios/:id",
    checkToken,
    ensureCentroCustoManagementRole,
    updateFuncionarioController,
  );
};

module.exports = funcionariosRoutes;
