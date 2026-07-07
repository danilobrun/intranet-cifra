const agendaCorporativaRoutes = require("./agendaCorporativa.routes");
const boletinsRoutes = require("./boletins.routes");
const carsRoutes = require("./cars.routes");
const centroCustoMovimentacoesRoutes = require("./centroCustoMovimentacoes.routes");
const centrosCustoRoutes = require("./centrosCusto.routes");
const clientesRoutes = require("./clientes.routes");
const contratosRoutes = require("./contratos.routes");
const funcionariosRoutes = require("./funcionarios.routes");
const inscriptionsRoutes = require("./inscriptions.routes");
const portalsRoutes = require("./portals.routes");
const platesRoutes = require("./plates.routes");
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
  agendaCorporativaRoutes(app);
  boletinsRoutes(app);
  carsRoutes(app);
  centroCustoMovimentacoesRoutes(app);
  centrosCustoRoutes(app);
  clientesRoutes(app);
  contratosRoutes(app);
  funcionariosRoutes(app);
  usersRoutes(app);
  rentsRoutes(app);
  platesRoutes(app);
  roleRoutes(app);
  portalsRoutes(app);
  tutorialsRoutes(app);
  inscriptionsRoutes(app);
  resumoContratosRoutes(app);
  updateRoutes(app);
};

module.exports = registersRoutes;
