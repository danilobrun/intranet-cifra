const {
  FuncionarioServiceError,
  createFuncionario,
  exportFuncionariosCsv,
  getFuncionarioById,
  importFuncionariosCsv,
  inactivateFuncionario,
  listCentrosCustoFuncionarios,
  listFuncionarios,
  previewFuncionariosCsvImport,
  updateFuncionario,
} = require("../../services/funcionarios.service");

const handleFuncionarioError = (res, error, context) => {
  if (error instanceof FuncionarioServiceError) {
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

const listFuncionariosController = async (req, res) => {
  try {
    const result = await listFuncionarios(req.query);

    return res.status(200).json(result);
  } catch (error) {
    return handleFuncionarioError(res, error, "listFuncionarios");
  }
};

const listCentrosCustoFuncionariosController = async (req, res) => {
  try {
    const result = await listCentrosCustoFuncionarios();

    return res.status(200).json(result);
  } catch (error) {
    return handleFuncionarioError(res, error, "listCentrosCustoFuncionarios");
  }
};

const exportFuncionariosCsvController = async (req, res) => {
  try {
    const result = await exportFuncionariosCsv(req.query);

    res.set("Content-Type", "text/csv; charset=utf-8");
    res.set(
      "Content-Disposition",
      `attachment; filename="${result.fileName}"`,
    );

    return res.status(200).send(result.content);
  } catch (error) {
    return handleFuncionarioError(res, error, "exportFuncionariosCsv");
  }
};

const getFuncionarioController = async (req, res) => {
  try {
    const funcionario = await getFuncionarioById(req.params.id);

    return res.status(200).json(funcionario);
  } catch (error) {
    return handleFuncionarioError(res, error, "getFuncionario");
  }
};

const createFuncionarioController = async (req, res) => {
  try {
    const funcionario = await createFuncionario(req.body, req.user);

    return res.status(201).json({
      msg: "Funcionário cadastrado com sucesso.",
      funcionario,
    });
  } catch (error) {
    return handleFuncionarioError(res, error, "createFuncionario");
  }
};

const previewFuncionariosCsvImportController = async (req, res) => {
  try {
    const result = await previewFuncionariosCsvImport(req.files);

    return res.status(200).json(result);
  } catch (error) {
    return handleFuncionarioError(
      res,
      error,
      "previewFuncionariosCsvImport",
    );
  }
};

const importFuncionariosCsvController = async (req, res) => {
  try {
    const result = await importFuncionariosCsv(req.files, req.user);

    return res.status(200).json(result);
  } catch (error) {
    return handleFuncionarioError(res, error, "importFuncionariosCsv");
  }
};

const updateFuncionarioController = async (req, res) => {
  try {
    const funcionario = await updateFuncionario(
      req.params.id,
      req.body,
      req.user,
    );

    return res.status(200).json({
      msg: "Funcionário atualizado com sucesso.",
      funcionario,
    });
  } catch (error) {
    return handleFuncionarioError(res, error, "updateFuncionario");
  }
};

const inactivateFuncionarioController = async (req, res) => {
  try {
    const result = await inactivateFuncionario(req.params.id, req.user);

    return res.status(200).json({
      msg: result.changed
        ? "Funcionário inativado com sucesso."
        : "Funcionário já estava inativo.",
      funcionario: result.funcionario,
    });
  } catch (error) {
    return handleFuncionarioError(res, error, "inactivateFuncionario");
  }
};

module.exports = {
  createFuncionarioController,
  exportFuncionariosCsvController,
  getFuncionarioController,
  importFuncionariosCsvController,
  inactivateFuncionarioController,
  listCentrosCustoFuncionariosController,
  listFuncionariosController,
  previewFuncionariosCsvImportController,
  updateFuncionarioController,
};
