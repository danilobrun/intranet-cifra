const { checkToken, ensureRoleCodes } = require("../middleware/checktoken");
const {
  createCentroCustoController,
  deleteCentroCustoController,
  getCentroCustoController,
  listCentrosCustoController,
  updateCentroCustoController,
} = require("../presentation/controllers/centrosCusto.controller");

const CENTROS_CUSTO_MANAGEMENT_ROLES = ["1", "admin", "rh"];
const ensureCentroCustoManagementRole = ensureRoleCodes(
  CENTROS_CUSTO_MANAGEMENT_ROLES,
);

const centrosCustoRoutes = (app) => {
  app.get(
    "/centros-custo",
    checkToken,
    ensureCentroCustoManagementRole,
    listCentrosCustoController,
  );
  app.get(
    "/centros-custo/:id",
    checkToken,
    ensureCentroCustoManagementRole,
    getCentroCustoController,
  );
  app.post(
    "/centros-custo",
    checkToken,
    ensureCentroCustoManagementRole,
    createCentroCustoController,
  );
  app.put(
    "/centros-custo/:id",
    checkToken,
    ensureCentroCustoManagementRole,
    updateCentroCustoController,
  );
  app.patch(
    "/centros-custo/:id",
    checkToken,
    ensureCentroCustoManagementRole,
    updateCentroCustoController,
  );
  app.delete(
    "/centros-custo/:id",
    checkToken,
    ensureCentroCustoManagementRole,
    deleteCentroCustoController,
  );
};

module.exports = centrosCustoRoutes;
