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
  app.post("/portals/auth/register", checkToken, createPortal);
  app.get("/portals/:id", checkToken, listPortalsById);
  app.delete("/portals/:id", checkToken, deletePortalsById);
  app.put("/portals/:id", checkToken, editPortal);
};

module.exports = portalsRoutes;
