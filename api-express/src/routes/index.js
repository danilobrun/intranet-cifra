const carsRoutes = require("./cars.routes");
const contratosRoutes = require("./contratos.routes");
const inscriptionsRoutes = require("./inscriptions.routes");
const portalsRoutes = require("./portals.routes");
const roleRoutes = require("./role.routes");
const rentsRoutes = require("./rent.cars.routes");
const tutorialsRoutes = require("./tutorials.routes");
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
  contratosRoutes(app);
  usersRoutes(app);
  rentsRoutes(app);
  roleRoutes(app);
  portalsRoutes(app);
  tutorialsRoutes(app);
  inscriptionsRoutes(app);
  updateRoutes(app);
};

module.exports = registersRoutes;
