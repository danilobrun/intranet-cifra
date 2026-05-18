const { checkToken, ensureRoleCodes } = require("../middleware/checktoken");
const {
  listTutorials,
  listAdminTutorials,
  listTutorialById,
  createTutorial,
  editTutorial,
  updateTutorialStatus,
  archiveTutorial,
  deleteArchivedTutorial,
} = require("../presentation/controllers/tutorials.controller");

const tutorialsRoutes = (app) => {
  app.get("/tutorials", checkToken, listTutorials);
  app.get("/admin/tutorials", checkToken, ensureRoleCodes(["1"]), listAdminTutorials);
  app.get("/tutorials/:id", checkToken, listTutorialById);
  app.post("/tutorials", checkToken, ensureRoleCodes(["1"]), createTutorial);
  app.put("/tutorials/:id", checkToken, ensureRoleCodes(["1"]), editTutorial);
  app.patch(
    "/tutorials/:id/status",
    checkToken,
    ensureRoleCodes(["1"]),
    updateTutorialStatus,
  );
  app.delete(
    "/tutorials/:id/permanent",
    checkToken,
    ensureRoleCodes(["1"]),
    deleteArchivedTutorial,
  );
  app.delete("/tutorials/:id", checkToken, ensureRoleCodes(["1"]), archiveTutorial);
};

module.exports = tutorialsRoutes;
