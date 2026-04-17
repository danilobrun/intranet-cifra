const { checkToken, ensureRoleCodes } = require("../middleware/checktoken");
const {
  listRoles,
  listRoleById,
  listRolePortalOptions,
  createRole,
  editRole,
  deleteRole,
} = require("../presentation/controllers/roles.controller");

const roleRoutes = (app) => {
  app.get("/roles", checkToken, ensureRoleCodes(["1"]), listRoles);
  app.get(
    "/roles/portals/options",
    checkToken,
    ensureRoleCodes(["1"]),
    listRolePortalOptions,
  );
  app.get("/roles/:id", checkToken, ensureRoleCodes(["1"]), listRoleById);
  app.post("/roles", checkToken, ensureRoleCodes(["1"]), createRole);
  app.put("/roles/:id", checkToken, ensureRoleCodes(["1"]), editRole);
  app.patch("/roles/:id", checkToken, ensureRoleCodes(["1"]), editRole);
  app.delete("/roles/:id", checkToken, ensureRoleCodes(["1"]), deleteRole);
};

module.exports = roleRoutes;
