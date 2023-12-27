const { checkToken } = require("../middleware/checktoken");
const {
  ListUpdates,
  createUpdate,
} = require("../presentation/controllers/updatetime.controller");

const updateRoutes = (app) => {
  app.get("/listupdates", ListUpdates);
  app.post("/createupdate", createUpdate);
};

module.exports = updateRoutes;
