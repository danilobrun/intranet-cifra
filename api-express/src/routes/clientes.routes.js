const { checkToken, ensureRoleCodes } = require("../middleware/checktoken");
const {
  listClientes,
  createCliente,
  editCliente,
  deleteCliente,
} = require("../presentation/controllers/clientes.controller");

const allowedClienteRoles = ["1", "dono"];

const clientesRoutes = (app) => {
  app.get(
    "/clientes",
    checkToken,
    ensureRoleCodes(allowedClienteRoles),
    listClientes,
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
};

module.exports = clientesRoutes;
