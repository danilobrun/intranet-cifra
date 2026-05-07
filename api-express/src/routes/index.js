const carsRoutes = require("./cars.routes");
const inscriptionsRoutes = require("./inscriptions.routes");
const portalsRoutes = require("./portals.routes");
const platesRoutes = require("./plates.routes");
const roleRoutes = require("./role.routes");
const rentsRoutes = require("./rent.cars.routes");
const usersRoutes = require("./users.routes");
const updateRoutes = require("./updates.routes");
// const carsRoutes = require("./cars.routes")

const registersRoutes = (app) => {
  app.get("/", (req, res) => {
    res.status(200).json({
      msg: "Bem vindo a API da Cifra Engenharia.",
    });
  });
  carsRoutes(app);
  usersRoutes(app);
  rentsRoutes(app);
  platesRoutes(app);
  roleRoutes(app);
  portalsRoutes(app);
  inscriptionsRoutes(app);
  updateRoutes(app);
};

module.exports = registersRoutes;
