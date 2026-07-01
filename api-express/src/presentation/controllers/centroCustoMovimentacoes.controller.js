const {
  CentroCustoMovimentacaoServiceError,
  applyCentroCustoMovimentacaoNaFolha,
  createCentroCustoMovimentacao,
  getCentroCustoMovimentacaoById,
  listCentroCustoMovimentacoes,
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
  getCentroCustoMovimentacaoController,
  listCentroCustoMovimentacoesController,
};
