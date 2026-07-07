const {
  AgendaCorporativaServiceError,
  createAgendaCorporativaEvento,
  deleteAgendaCorporativaEvento,
  getAgendaCorporativaEventoById,
  listAgendaCorporativaEventos,
  updateAgendaCorporativaEvento,
} = require("../../services/agendaCorporativa.service");

const handleAgendaCorporativaError = (res, error, context) => {
  if (error instanceof AgendaCorporativaServiceError) {
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

const listAgendaCorporativaEventosController = async (req, res) => {
  try {
    const result = await listAgendaCorporativaEventos(req.query, req.user);

    return res.status(200).json(result);
  } catch (error) {
    return handleAgendaCorporativaError(
      res,
      error,
      "listAgendaCorporativaEventos",
    );
  }
};

const getAgendaCorporativaEventoController = async (req, res) => {
  try {
    const evento = await getAgendaCorporativaEventoById(req.params.id, req.user);

    return res.status(200).json(evento);
  } catch (error) {
    return handleAgendaCorporativaError(
      res,
      error,
      "getAgendaCorporativaEvento",
    );
  }
};

const createAgendaCorporativaEventoController = async (req, res) => {
  try {
    const evento = await createAgendaCorporativaEvento(req.body, req.user);

    return res.status(201).json({
      msg: "Evento criado com sucesso.",
      evento,
    });
  } catch (error) {
    return handleAgendaCorporativaError(
      res,
      error,
      "createAgendaCorporativaEvento",
    );
  }
};

const updateAgendaCorporativaEventoController = async (req, res) => {
  try {
    const evento = await updateAgendaCorporativaEvento(
      req.params.id,
      req.body,
      req.user,
    );

    return res.status(200).json({
      msg: "Evento atualizado com sucesso.",
      evento,
    });
  } catch (error) {
    return handleAgendaCorporativaError(
      res,
      error,
      "updateAgendaCorporativaEvento",
    );
  }
};

const deleteAgendaCorporativaEventoController = async (req, res) => {
  try {
    const evento = await deleteAgendaCorporativaEvento(req.params.id, req.user);

    return res.status(200).json({
      msg: "Evento excluido com sucesso.",
      evento,
    });
  } catch (error) {
    return handleAgendaCorporativaError(
      res,
      error,
      "deleteAgendaCorporativaEvento",
    );
  }
};

module.exports = {
  createAgendaCorporativaEventoController,
  deleteAgendaCorporativaEventoController,
  getAgendaCorporativaEventoController,
  listAgendaCorporativaEventosController,
  updateAgendaCorporativaEventoController,
};
