const { checkToken } = require("../middleware/checktoken");
const {
  listContractManagers,
  listContratos,
  listContratoById,
  createContrato,
  editContrato,
  updateContratoStatus,
} = require("../presentation/controllers/contratos.controller");

const contratosRoutes = (app) => {
  app.get("/contratos", checkToken, listContratos);
  app.get("/contratos/gestores", checkToken, listContractManagers);
  app.get("/contratos/:id", checkToken, listContratoById);
  app.post("/contratos", checkToken, createContrato);
  app.put("/contratos/:id", checkToken, editContrato);
  app.patch("/contratos/:id", checkToken, editContrato);
  app.patch("/contratos/:id/status", checkToken, updateContratoStatus);
};

module.exports = contratosRoutes;
