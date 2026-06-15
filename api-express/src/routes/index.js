const boletinsRoutes = require("./boletins.routes");
const carsRoutes = require("./cars.routes");
const clientesRoutes = require("./clientes.routes");
const contratosRoutes = require("./contratos.routes");
const inscriptionsRoutes = require("./inscriptions.routes");
const portalsRoutes = require("./portals.routes");
const roleRoutes = require("./role.routes");
const rentsRoutes = require("./rent.cars.routes");
const resumoContratosRoutes = require("./resumoContratos.routes");
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
  boletinsRoutes(app);
  carsRoutes(app);
  clientesRoutes(app);
  contratosRoutes(app);
  usersRoutes(app);
  rentsRoutes(app);
  roleRoutes(app);
  portalsRoutes(app);
  tutorialsRoutes(app);
  inscriptionsRoutes(app);
  resumoContratosRoutes(app);
  updateRoutes(app);
};

module.exports = registersRoutes;
