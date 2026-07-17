const { checkToken, ensureRoleCodes } = require("../middleware/checktoken");
const {
  listResumoContratos,
  listInactiveResumoContratos,
  exportResumoContratosMacro,
  createResumoContrato,
  listResumoContratoById,
  editResumoContrato,
  deleteResumoContrato,
  reactivateResumoContrato,
  createResumoContratoBm,
  editResumoContratoBm,
  deleteResumoContratoBm,
  manageResumoContratoBms,
} = require("../presentation/controllers/resumoContratos.controller");

const allowedResumoContratosRoles = ["1", "dono"];
const allowedResumoContratosReactivationRoles = ["1"];

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
    "/resumo-contratos/exportacao-macro",
    checkToken,
    ensureRoleCodes(allowedResumoContratosRoles),
    exportResumoContratosMacro,
  );
  app.get(
    "/resumo-contratos/inactive",
    checkToken,
    ensureRoleCodes(allowedResumoContratosReactivationRoles),
    listInactiveResumoContratos,
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
  app.patch(
    "/resumo-contratos/:id/reactivate",
    checkToken,
    ensureRoleCodes(allowedResumoContratosReactivationRoles),
    reactivateResumoContrato,
  );
  app.put(
    "/resumo-contratos/:id/bms",
    checkToken,
    ensureRoleCodes(allowedResumoContratosRoles),
    manageResumoContratoBms,
  );
  app.post(
    "/resumo-contratos/:id/bms",
    checkToken,
    ensureRoleCodes(allowedResumoContratosRoles),
    createResumoContratoBm,
  );
  app.put(
    "/resumo-contratos/:id/bms/:bmId",
    checkToken,
    ensureRoleCodes(allowedResumoContratosRoles),
    editResumoContratoBm,
  );
  app.delete(
    "/resumo-contratos/:id/bms/:bmId",
    checkToken,
    ensureRoleCodes(allowedResumoContratosRoles),
    deleteResumoContratoBm,
  );
};

module.exports = resumoContratosRoutes;
