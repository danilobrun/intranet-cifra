const { checkToken, ensureRoleCodes } = require("../middleware/checktoken");
const {
  listResumoContratos,
  createResumoContrato,
  listResumoContratoById,
  editResumoContrato,
  deleteResumoContrato,
  manageResumoContratoBms,
} = require("../presentation/controllers/resumoContratos.controller");

const allowedResumoContratosRoles = ["1", "dono"];

const resumoContratosRoutes = (app) => {
  app.get(
    "/resumo-contratos",
    checkToken,
    ensureRoleCodes(allowedResumoContratosRoles),
    listResumoContratos,
  );
  app.post(
    "/resumo-contratos",
    checkToken,
    ensureRoleCodes(allowedResumoContratosRoles),
    createResumoContrato,
  );
  app.get(
    "/resumo-contratos/:id",
    checkToken,
    ensureRoleCodes(allowedResumoContratosRoles),
    listResumoContratoById,
  );
  app.put(
    "/resumo-contratos/:id",
    checkToken,
    ensureRoleCodes(allowedResumoContratosRoles),
    editResumoContrato,
  );
  app.delete(
    "/resumo-contratos/:id",
    checkToken,
    ensureRoleCodes(allowedResumoContratosRoles),
    deleteResumoContrato,
  );
  app.put(
    "/resumo-contratos/:id/bms",
    checkToken,
    ensureRoleCodes(allowedResumoContratosRoles),
    manageResumoContratoBms,
  );
};

module.exports = resumoContratosRoutes;
