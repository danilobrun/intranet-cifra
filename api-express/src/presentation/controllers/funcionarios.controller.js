const {
  FuncionarioServiceError,
  createFuncionario,
  getFuncionarioById,
  inactivateFuncionario,
  listFuncionarios,
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
      msg: "Funcionario cadastrado com sucesso.",
      funcionario,
    });
  } catch (error) {
    return handleFuncionarioError(res, error, "createFuncionario");
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
      msg: "Funcionario atualizado com sucesso.",
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
        ? "Funcionario inativado com sucesso."
        : "Funcionario ja estava inativo.",
      funcionario: result.funcionario,
    });
  } catch (error) {
    return handleFuncionarioError(res, error, "inactivateFuncionario");
  }
};

module.exports = {
  createFuncionarioController,
  getFuncionarioController,
  inactivateFuncionarioController,
  listFuncionariosController,
  updateFuncionarioController,
};
