const {
  CentroCustoServiceError,
  createCentroCusto,
  deleteCentroCusto,
  getCentroCustoById,
  listCentrosCusto,
  updateCentroCusto,
} = require("../../services/centrosCusto.service");

const handleCentroCustoError = (res, error, context) => {
  if (error instanceof CentroCustoServiceError) {
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

const listCentrosCustoController = async (req, res) => {
  try {
    const result = await listCentrosCusto(req.query);

    return res.status(200).json(result);
  } catch (error) {
    return handleCentroCustoError(res, error, "listCentrosCusto");
  }
};

const getCentroCustoController = async (req, res) => {
  try {
    const centroCusto = await getCentroCustoById(req.params.id);

    return res.status(200).json(centroCusto);
  } catch (error) {
    return handleCentroCustoError(res, error, "getCentroCusto");
  }
};

const createCentroCustoController = async (req, res) => {
  try {
    const centroCusto = await createCentroCusto(req.body, req.user);

    return res.status(201).json({
      msg: "Centro de custo cadastrado com sucesso.",
      centroCusto,
    });
  } catch (error) {
    return handleCentroCustoError(res, error, "createCentroCusto");
  }
};

const updateCentroCustoController = async (req, res) => {
  try {
    const result = await updateCentroCusto(req.params.id, req.body, req.user);

    return res.status(200).json({
      msg: "Centro de custo atualizado com sucesso.",
      ...result,
    });
  } catch (error) {
    return handleCentroCustoError(res, error, "updateCentroCusto");
  }
};

const deleteCentroCustoController = async (req, res) => {
  try {
    const result = await deleteCentroCusto(req.params.id);

    return res.status(200).json({
      msg: "Centro de custo excluido com sucesso.",
      ...result,
    });
  } catch (error) {
    return handleCentroCustoError(res, error, "deleteCentroCusto");
  }
};

module.exports = {
  createCentroCustoController,
  deleteCentroCustoController,
  getCentroCustoController,
  listCentrosCustoController,
  updateCentroCustoController,
};
