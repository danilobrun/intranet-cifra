const {
  listPortals,
  createPortal,
  listPortalsById,
  deletePortalsById,
  editPortal,
} = require("../presentation/controllers/portals.controller");

const portalsRoutes = (app) => {
  app.get("/portals", listPortals);
  app.post("/portals/auth/register", createPortal);
  app.get("/portals/:id", listPortalsById);
  app.delete("/portals/:id", deletePortalsById);
  app.put("/portals/:id", editPortal);
};

module.exports = portalsRoutes;
