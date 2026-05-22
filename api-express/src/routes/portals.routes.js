const { checkToken, ensureRoleCodes } = require("../middleware/checktoken");
const {
  listPortals,
  listAllPortals,
  createPortal,
  listPortalsById,
  deletePortalsById,
  editPortal,
} = require("../presentation/controllers/portals.controller");

const portalsRoutes = (app) => {
  app.get("/portals", checkToken, listPortals);
  app.get("/admin/portals", checkToken, ensureRoleCodes(["1"]), listAllPortals);
  app.post(
    "/portals/auth/register",
    checkToken,
    ensureRoleCodes(["1"]),
    createPortal,
  );
  app.get("/portals/:id", checkToken, listPortalsById);
  app.delete(
    "/portals/:id",
    checkToken,
    ensureRoleCodes(["1"]),
    deletePortalsById,
  );
  app.put("/portals/:id", checkToken, ensureRoleCodes(["1"]), editPortal);
};

module.exports = portalsRoutes;
