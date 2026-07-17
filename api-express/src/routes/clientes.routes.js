const { checkToken, ensureRoleCodes } = require("../middleware/checktoken");
const {
  listClientes,
  listInactiveClientes,
  createCliente,
  editCliente,
  deleteCliente,
  reactivateCliente,
} = require("../presentation/controllers/clientes.controller");

const allowedClienteRoles = ["1", "dono"];
const allowedClienteReactivationRoles = ["1"];

const clientesRoutes = (app) => {
  app.get(
    "/clientes",
    checkToken,
    ensureRoleCodes(allowedClienteRoles),
    listClientes,
  );
  app.get(
    "/clientes/inactive",
    checkToken,
    ensureRoleCodes(allowedClienteReactivationRoles),
    listInactiveClientes,
  );
  app.post(
    "/clientes",
    checkToken,
    ensureRoleCodes(allowedClienteRoles),
    createCliente,
  );
  app.put(
    "/clientes/:id",
    checkToken,
    ensureRoleCodes(allowedClienteRoles),
    editCliente,
  );
  app.delete(
    "/clientes/:id",
    checkToken,
    ensureRoleCodes(allowedClienteRoles),
    deleteCliente,
  );
  app.patch(
    "/clientes/:id/reactivate",
    checkToken,
    ensureRoleCodes(allowedClienteReactivationRoles),
    reactivateCliente,
  );
};

module.exports = clientesRoutes;
