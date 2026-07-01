const { checkToken, ensureRoleCodes } = require("../middleware/checktoken");
const {
  applyCentroCustoMovimentacaoNaFolhaController,
  createCentroCustoMovimentacaoController,
  exportCentroCustoMovimentacoesCsvController,
  getCentroCustoMovimentacaoController,
  listCentroCustoMovimentacoesController,
  listMinhasCentroCustoMovimentacoesController,
} = require("../presentation/controllers/centroCustoMovimentacoes.controller");

const CENTRO_CUSTO_MANAGEMENT_ROLES = ["1", "admin", "rh"];
const CENTRO_CUSTO_OPERATION_ROLES = [
  ...CENTRO_CUSTO_MANAGEMENT_ROLES,
  "obras",
  "2-6",
];

const ensureCentroCustoManagementRole = ensureRoleCodes(
  CENTRO_CUSTO_MANAGEMENT_ROLES,
);
const ensureCentroCustoOperationRole = ensureRoleCodes(
  CENTRO_CUSTO_OPERATION_ROLES,
);

const centroCustoMovimentacoesRoutes = (app) => {
  app.get(
    "/centro-custo-movimentacoes",
    checkToken,
    ensureCentroCustoManagementRole,
    listCentroCustoMovimentacoesController,
  );
  app.get(
    "/centro-custo-movimentacoes/minhas",
    checkToken,
    ensureCentroCustoOperationRole,
    listMinhasCentroCustoMovimentacoesController,
  );
  app.get(
    "/centro-custo-movimentacoes/exportar",
    checkToken,
    ensureCentroCustoManagementRole,
    exportCentroCustoMovimentacoesCsvController,
  );
  app.get(
    "/centro-custo-movimentacoes/:id",
    checkToken,
    ensureCentroCustoManagementRole,
    getCentroCustoMovimentacaoController,
  );
  app.post(
    "/centro-custo-movimentacoes",
    checkToken,
    ensureCentroCustoOperationRole,
    createCentroCustoMovimentacaoController,
  );
  app.patch(
    "/centro-custo-movimentacoes/:id/aplicar-folha",
    checkToken,
    ensureCentroCustoManagementRole,
    applyCentroCustoMovimentacaoNaFolhaController,
  );
};

module.exports = centroCustoMovimentacoesRoutes;
