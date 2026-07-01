const { checkToken } = require("../middleware/checktoken");
const {
  applyCentroCustoMovimentacaoNaFolhaController,
  createCentroCustoMovimentacaoController,
  getCentroCustoMovimentacaoController,
  listCentroCustoMovimentacoesController,
} = require("../presentation/controllers/centroCustoMovimentacoes.controller");

const centroCustoMovimentacoesRoutes = (app) => {
  app.get(
    "/centro-custo-movimentacoes",
    checkToken,
    listCentroCustoMovimentacoesController,
  );
  app.get(
    "/centro-custo-movimentacoes/:id",
    checkToken,
    getCentroCustoMovimentacaoController,
  );
  app.post(
    "/centro-custo-movimentacoes",
    checkToken,
    createCentroCustoMovimentacaoController,
  );
  app.patch(
    "/centro-custo-movimentacoes/:id/aplicar-folha",
    checkToken,
    applyCentroCustoMovimentacaoNaFolhaController,
  );
};

module.exports = centroCustoMovimentacoesRoutes;
