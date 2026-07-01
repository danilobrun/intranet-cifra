const { checkToken } = require("../middleware/checktoken");
const {
  applyCentroCustoMovimentacaoNaFolhaController,
  createCentroCustoMovimentacaoController,
  exportCentroCustoMovimentacoesCsvController,
  getCentroCustoMovimentacaoController,
  listCentroCustoMovimentacoesController,
  listMinhasCentroCustoMovimentacoesController,
} = require("../presentation/controllers/centroCustoMovimentacoes.controller");

const centroCustoMovimentacoesRoutes = (app) => {
  app.get(
    "/centro-custo-movimentacoes",
    checkToken,
    listCentroCustoMovimentacoesController,
  );
  app.get(
    "/centro-custo-movimentacoes/minhas",
    checkToken,
    listMinhasCentroCustoMovimentacoesController,
  );
  app.get(
    "/centro-custo-movimentacoes/exportar",
    checkToken,
    exportCentroCustoMovimentacoesCsvController,
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
