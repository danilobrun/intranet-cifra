const { checkToken } = require("../middleware/checktoken");
const {
  createAgendaCorporativaEventoController,
  deleteAgendaCorporativaEventoController,
  getAgendaCorporativaEventoController,
  listAgendaCorporativaEventosController,
  updateAgendaCorporativaEventoController,
} = require("../presentation/controllers/agendaCorporativa.controller");

const agendaCorporativaRoutes = (app) => {
  app.get(
    "/agenda-corporativa/eventos",
    checkToken,
    listAgendaCorporativaEventosController,
  );
  app.get(
    "/agenda-corporativa/eventos/:id",
    checkToken,
    getAgendaCorporativaEventoController,
  );
  app.post(
    "/agenda-corporativa/eventos",
    checkToken,
    createAgendaCorporativaEventoController,
  );
  app.put(
    "/agenda-corporativa/eventos/:id",
    checkToken,
    updateAgendaCorporativaEventoController,
  );
  app.delete(
    "/agenda-corporativa/eventos/:id",
    checkToken,
    deleteAgendaCorporativaEventoController,
  );
};

module.exports = agendaCorporativaRoutes;

