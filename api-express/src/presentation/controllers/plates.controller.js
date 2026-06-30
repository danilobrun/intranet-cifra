const {
  PlateServiceError,
  createPlate,
  desactivatePlate,
  getActivePlateById,
  listActivePlates,
  listInactivePlates,
  listPlateMovements,
  restorePlate,
  updatePlate,
} = require("../../services/plates.service");

const handlePlateError = (res, error, context) => {
  if (error instanceof PlateServiceError) {
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

const listPlates = async (req, res) => {
  try {
    const plates = await listActivePlates(req.query);

    return res.status(200).json(plates);
  } catch (error) {
    return handlePlateError(res, error, "listPlates");
  }
};

const listInactivePlatesController = async (req, res) => {
  try {
    const plates = await listInactivePlates(req.query);

    return res.status(200).json(plates);
  } catch (error) {
    return handlePlateError(res, error, "listInactivePlates");
  }
};

const getPlateController = async (req, res) => {
  try {
    const plate = await getActivePlateById(req.params.id);

    return res.status(200).json(plate);
  } catch (error) {
    return handlePlateError(res, error, "getPlate");
  }
};

const createPlateController = async (req, res) => {
  try {
    const plate = await createPlate(req.body, req.user);

    return res.status(201).json({
      msg: "Placa cadastrada com sucesso.",
      plate,
    });
  } catch (error) {
    return handlePlateError(res, error, "createPlate");
  }
};

const updatePlateController = async (req, res) => {
  try {
    const result = await updatePlate(req.params.id, req.body, req.user);

    return res.status(200).json({
      msg: result.changed
        ? "Placa atualizada com sucesso."
        : "Nenhuma alteração aplicada.",
      plate: result.plate,
    });
  } catch (error) {
    return handlePlateError(res, error, "updatePlate");
  }
};

const desactivatePlateController = async (req, res) => {
  try {
    const plate = await desactivatePlate(req.params.id, req.user);

    return res.status(200).json({
      msg: "Placa inativada com sucesso.",
      plate,
    });
  } catch (error) {
    return handlePlateError(res, error, "desactivatePlate");
  }
};

const restorePlateController = async (req, res) => {
  try {
    const plate = await restorePlate(req.params.id, req.user);

    return res.status(200).json({
      msg: "Placa reativada com sucesso.",
      plate,
    });
  } catch (error) {
    return handlePlateError(res, error, "restorePlate");
  }
};

const listPlateMovementsController = async (req, res) => {
  try {
    const movements = await listPlateMovements(req.params.id);

    return res.status(200).json(movements);
  } catch (error) {
    return handlePlateError(res, error, "listPlateMovements");
  }
};

module.exports = {
  listPlates,
  listInactivePlatesController,
  getPlateController,
  listPlateMovementsController,
  createPlateController,
  desactivatePlateController,
  restorePlateController,
  updatePlateController,
};
