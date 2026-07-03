const {
  CentroCustoMovimentacaoServiceError,
  applyCentroCustoMovimentacaoNaFolha,
  createCentroCustoMovimentacao,
  exportCentroCustoMovimentacoesCsv,
  getCentroCustoMovimentacaoById,
  listCentroCustoMovimentacoes,
  listMinhasCentroCustoMovimentacoes,
} = require("../../services/centroCustoMovimentacoes.service");

const handleCentroCustoMovimentacaoError = (res, error, context) => {
  if (error instanceof CentroCustoMovimentacaoServiceError) {
    return res.status(error.statusCode).json({
      msg: error.msg,
      ...error.details,
    });
  }

  console.log(`${context} error`, error);
  return res.status(500).json({
    msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
  });
};

const listCentroCustoMovimentacoesController = async (req, res) => {
  try {
    const result = await listCentroCustoMovimentacoes(req.query);

    return res.status(200).json(result);
  } catch (error) {
    return handleCentroCustoMovimentacaoError(
      res,
      error,
      "listCentroCustoMovimentacoes",
    );
  }
};

const listMinhasCentroCustoMovimentacoesController = async (req, res) => {
  try {
    const result = await listMinhasCentroCustoMovimentacoes(
      req.query,
      req.user,
    );

    return res.status(200).json(result);
  } catch (error) {
    return handleCentroCustoMovimentacaoError(
      res,
      error,
      "listMinhasCentroCustoMovimentacoes",
    );
  }
};

const exportCentroCustoMovimentacoesCsvController = async (req, res) => {
  try {
    const result = await exportCentroCustoMovimentacoesCsv(req.query);

    res.set("Content-Type", "text/csv; charset=utf-8");
    res.set(
      "Content-Disposition",
      `attachment; filename="${result.fileName}"`,
    );

    return res.status(200).send(result.content);
  } catch (error) {
    return handleCentroCustoMovimentacaoError(
      res,
      error,
      "exportCentroCustoMovimentacoesCsv",
    );
  }
};

const getCentroCustoMovimentacaoController = async (req, res) => {
  try {
    const movimentacao = await getCentroCustoMovimentacaoById(req.params.id);

    return res.status(200).json(movimentacao);
  } catch (error) {
    return handleCentroCustoMovimentacaoError(
      res,
      error,
      "getCentroCustoMovimentacao",
    );
  }
};

const createCentroCustoMovimentacaoController = async (req, res) => {
  try {
    const movimentacao = await createCentroCustoMovimentacao(
      req.body,
      req.user,
    );

    return res.status(201).json({
      msg: "Movimentação cadastrada com sucesso.",
      movimentacao,
    });
  } catch (error) {
    return handleCentroCustoMovimentacaoError(
      res,
      error,
      "createCentroCustoMovimentacao",
    );
  }
};

const applyCentroCustoMovimentacaoNaFolhaController = async (req, res) => {
  try {
    const movimentacao = await applyCentroCustoMovimentacaoNaFolha(
      req.params.id,
      req.user,
    );

    return res.status(200).json({
      msg: "Movimentação aplicada na folha com sucesso.",
      movimentacao,
    });
  } catch (error) {
    return handleCentroCustoMovimentacaoError(
      res,
      error,
      "applyCentroCustoMovimentacaoNaFolha",
    );
  }
};

module.exports = {
  applyCentroCustoMovimentacaoNaFolhaController,
  createCentroCustoMovimentacaoController,
  exportCentroCustoMovimentacoesCsvController,
  getCentroCustoMovimentacaoController,
  listCentroCustoMovimentacoesController,
  listMinhasCentroCustoMovimentacoesController,
};
