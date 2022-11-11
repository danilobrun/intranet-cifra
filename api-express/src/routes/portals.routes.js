const {
  listPortals,
  createPortal,
  listPortalsById,
} = require("../presentation/controllers/portals.controller");

const portalsRoutes = (app) => {
  app.get("/portals", listPortals);
  app.post("/portals/auth/register", createPortal);
  app.get("/portals/:id", listPortalsById);
};

module.exports = portalsRoutes;
