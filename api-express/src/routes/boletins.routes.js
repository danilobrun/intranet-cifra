const { checkToken } = require("../middleware/checktoken");
const {
  listBoletins,
  listBoletimById,
  createBoletim,
  editBoletim,
  deleteBoletim,
  createFaturamento,
  listFaturamentosByBoletim,
  deleteFaturamento,
  createPagamento,
  listPagamentosByBoletim,
  deletePagamento,
} = require("../presentation/controllers/boletins.controller");

const boletinsRoutes = (app) => {
  app.get("/boletins", checkToken, listBoletins);
  app.post("/boletins", checkToken, createBoletim);
  app.get("/boletins/:boletimId/faturamentos", checkToken, listFaturamentosByBoletim);
  app.post("/boletins/:boletimId/faturamentos", checkToken, createFaturamento);
  app.get("/boletins/:boletimId/pagamentos", checkToken, listPagamentosByBoletim);
  app.post("/boletins/:boletimId/pagamentos", checkToken, createPagamento);
  app.get("/boletins/:id", checkToken, listBoletimById);
  app.put("/boletins/:id", checkToken, editBoletim);
  app.patch("/boletins/:id", checkToken, editBoletim);
  app.delete("/boletins/:id", checkToken, deleteBoletim);
  app.delete("/faturamentos/:id", checkToken, deleteFaturamento);
  app.delete("/pagamentos/:id", checkToken, deletePagamento);
};

module.exports = boletinsRoutes;
