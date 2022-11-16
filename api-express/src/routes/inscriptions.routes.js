const {
  listInscriptions,
  listinscriptionById,
  createInscription,
  deleteInscriptionsById,
} = require("../presentation/controllers/inscriptions.controller");

const inscriptionsRoutes = (app) => {
  app.get("/inscriptions", listInscriptions);
  app.post("/inscriptions/auth/register", createInscription);
  app.get("/inscriptions/:id", listinscriptionById);
  app.delete("/inscriptions/:id", deleteInscriptionsById);
};

module.exports = inscriptionsRoutes;
