const Plate = require("../../models/Plate");
const PlateMovement = require("../../models/PlateMovement");
const { notifyPlateMovement } = require("./plateNotifications.service");
const mongoose = require("mongoose");

const EDITABLE_FIELDS = ["condutor", "contrato", "estado", "crlv"];

class PlateServiceError extends Error {
  constructor(statusCode, msg, details = {}) {
    super(msg);
    this.statusCode = statusCode;
    this.msg = msg;
    this.details = details;
  }
}

const normalizePlate = (value = "") =>
  String(value).replace(/[\s-]/g, "").toUpperCase();

const normalizeText = (value) => {
  if (value === null || value === undefined) return "";

  return String(value).trim();
};

const escapeRegex = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildPlateFilters = (query = {}, status) => {
  const filters = { status };
  const search = normalizeText(query.search || query.q);

  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");
    filters.$or = [
      { placa: regex },
      { condutor: regex },
      { contrato: regex },
      { estado: regex },
    ];
  }

  EDITABLE_FIELDS.slice(0, 3).forEach((field) => {
    const value = normalizeText(query[field]);

    if (value) {
      filters[field] = new RegExp(escapeRegex(value), "i");
    }
  });

  return filters;
};

const mapPlateSummary = (plate) => ({
  _id: plate._id,
  placa: plate.placa,
  condutor: plate.condutor,
  contrato: plate.contrato,
  estado: plate.estado,
  crlv: plate.crlv,
  responsavel: plate.responsavel,
  status: plate.status,
  deletedAt: plate.deletedAt,
  deletedBy: plate.deletedBy,
  createdAt: plate.createdAt,
  updatedAt: plate.updatedAt,
});

const mapPlateMovement = (movement) => ({
  _id: movement._id,
  placa: movement.placa,
  plateId: movement.plateId,
  action: movement.action,
  changedBy: movement.changedBy,
  changedAt: movement.changedAt,
  previousData: movement.previousData,
  newData: movement.newData,
  changes: movement.changes,
});

const findPlateByNormalizedPlate = (placa) =>
  Plate.findOne({ placa: normalizePlate(placa) })
    .populate("responsavel", "name email")
    .populate("deletedBy", "name email");

const createPlateMovement = async ({
  plate,
  action,
  changedBy,
  previousData = null,
  newData = null,
  changes = [],
}) => {
  let movement = await PlateMovement.create({
    placa: plate.placa,
    plateId: plate._id,
    action,
    changedBy,
    previousData,
    newData,
    changes,
  });

  try {
    movement = await movement.populate("changedBy", "name email");
    await notifyPlateMovement(movement);
  } catch (error) {
    console.log("notifyPlateMovement error", error);
  }

  return movement;
};

const validateEditablePayload = (payload = {}) => {
  const requestedFields = Object.keys(payload);

  if (requestedFields.includes("placa")) {
    throw new PlateServiceError(422, "A placa nao pode ser alterada.");
  }

  const invalidFields = requestedFields.filter(
    (field) => !EDITABLE_FIELDS.includes(field),
  );

  if (invalidFields.length) {
    throw new PlateServiceError(
      422,
      "Somente condutor, contrato, estado e crlv podem ser alterados.",
      { invalidFields },
    );
  }

  const editableFieldsInPayload = EDITABLE_FIELDS.filter((field) =>
    Object.prototype.hasOwnProperty.call(payload, field),
  );

  if (!editableFieldsInPayload.length) {
    throw new PlateServiceError(
      422,
      "Informe ao menos um campo para atualizar.",
    );
  }

  return editableFieldsInPayload;
};

const createPlate = async (payload = {}, user) => {
  const placa = normalizePlate(payload.placa);

  if (!placa) {
    throw new PlateServiceError(422, "A placa é obrigatória.");
  }

  if (!user?.id) {
    throw new PlateServiceError(401, "Usuário autenticado não identificado.");
  }

  const existingPlate = await findPlateByNormalizedPlate(placa);

  if (existingPlate?.status === "ATIVA") {
    throw new PlateServiceError(409, "Esta placa já esta cadastrada.", {
      plate: {
        placa: existingPlate.placa,
        condutor: existingPlate.condutor,
        contrato: existingPlate.contrato,
        estado: existingPlate.estado,
        status: existingPlate.status,
      },
    });
  }

  if (existingPlate?.status === "INATIVA") {
    throw new PlateServiceError(
      409,
      "Esta placa já existe como inativa e pode ser reativada por um perfil autorizado.",
      {
        plate: {
          placa: existingPlate.placa,
          condutor: existingPlate.condutor,
          contrato: existingPlate.contrato,
          estado: existingPlate.estado,
          status: existingPlate.status,
        },
      },
    );
  }

  try {
    const plate = await Plate.create({
      placa,
      condutor: normalizeText(payload.condutor),
      contrato: normalizeText(payload.contrato),
      estado: normalizeText(payload.estado),
      crlv: normalizeText(payload.crlv),
      responsavel: user.id,
      status: "ATIVA",
      deletedAt: null,
      deletedBy: null,
    });

    await createPlateMovement({
      plate,
      action: "CREATE",
      changedBy: user.id,
      previousData: null,
      newData: mapPlateSummary(plate),
      changes: [
        {
          field: "placa",
          from: null,
          to: plate.placa,
        },
      ],
    });

    const createdPlate = await Plate.findById(plate._id).populate(
      "responsavel",
      "name email",
    );

    return mapPlateSummary(createdPlate);
  } catch (error) {
    if (error?.code === 11000) {
      throw new PlateServiceError(409, "Esta placa já está cadastrada.");
    }

    throw error;
  }
};

const listPlatesByStatus = async (query, status) => {
  const filters = buildPlateFilters(query, status);

  const plates = await Plate.find(filters)
    .populate("responsavel", "name email")
    .populate("deletedBy", "name email")
    .sort({ updatedAt: -1, createdAt: -1 });

  return plates.map(mapPlateSummary);
};

const listActivePlates = (query = {}) => listPlatesByStatus(query, "ATIVA");

const listInactivePlates = (query = {}) => listPlatesByStatus(query, "INATIVA");

const getActivePlateById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new PlateServiceError(422, "Placa invalida.");
  }

  const plate = await Plate.findOne({ _id: id, status: "ATIVA" })
    .populate("responsavel", "name email")
    .populate("deletedBy", "name email");

  if (!plate) {
    throw new PlateServiceError(404, "Placa nao encontrada.");
  }

  return mapPlateSummary(plate);
};

const updatePlate = async (id, payload = {}, user) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new PlateServiceError(422, "Placa invalida.");
  }

  if (!user?.id) {
    throw new PlateServiceError(401, "Usuário autenticado não identificado.");
  }

  const editableFieldsInPayload = validateEditablePayload(payload);
  const plate = await Plate.findById(id);

  if (!plate) {
    throw new PlateServiceError(404, "Placa não encontrada.");
  }

  if (plate.status !== "ATIVA") {
    throw new PlateServiceError(
      409,
      "Placa inativa não pode ser editada. Reative a placa antes de alterar.",
    );
  }

  const previousData = mapPlateSummary(plate);
  const changes = [];

  editableFieldsInPayload.forEach((field) => {
    const nextValue = normalizeText(payload[field]);
    const previousValue = normalizeText(plate[field]);

    if (previousValue !== nextValue) {
      changes.push({
        field,
        from: previousValue,
        to: nextValue,
      });
      plate[field] = nextValue;
    }
  });

  if (!changes.length) {
    const currentPlate = await Plate.findById(id).populate(
      "responsavel",
      "name email",
    );

    return {
      plate: mapPlateSummary(currentPlate),
      changed: false,
    };
  }

  plate.responsavel = user.id;
  await plate.save();

  await createPlateMovement({
    plate,
    action: "UPDATE",
    changedBy: user.id,
    previousData,
    newData: mapPlateSummary(plate),
    changes,
  });

  const updatedPlate = await Plate.findById(plate._id).populate(
    "responsavel",
    "name email",
  );

  return {
    plate: mapPlateSummary(updatedPlate),
    changed: true,
  };
};

const desactivatePlate = async (id, user) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new PlateServiceError(422, "Placa invalida.");
  }

  if (!user?.id) {
    throw new PlateServiceError(401, "Usuario autenticado nao identificado.");
  }

  const plate = await Plate.findById(id);

  if (!plate) {
    throw new PlateServiceError(404, "Placa nao encontrada.");
  }

  if (plate.status === "INATIVA") {
    throw new PlateServiceError(409, "Placa ja esta inativa.");
  }

  const previousData = mapPlateSummary(plate);
  const deletedAt = new Date();

  plate.status = "INATIVA";
  plate.deletedAt = deletedAt;
  plate.deletedBy = user.id;
  plate.responsavel = user.id;

  await plate.save();

  await createPlateMovement({
    plate,
    action: "DELETE",
    changedBy: user.id,
    previousData,
    newData: mapPlateSummary(plate),
    changes: [
      {
        field: "status",
        from: previousData.status,
        to: plate.status,
      },
      {
        field: "deletedAt",
        from: previousData.deletedAt,
        to: deletedAt,
      },
      {
        field: "deletedBy",
        from: previousData.deletedBy,
        to: user.id,
      },
    ],
  });

  const desactivatedPlate = await Plate.findById(plate._id)
    .populate("responsavel", "name email")
    .populate("deletedBy", "name email");

  return mapPlateSummary(desactivatedPlate);
};

const restorePlate = async (id, user) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new PlateServiceError(422, "Placa invalida.");
  }

  if (!user?.id) {
    throw new PlateServiceError(401, "Usuario autenticado nao identificado.");
  }

  const plate = await Plate.findById(id);

  if (!plate) {
    throw new PlateServiceError(404, "Placa nao encontrada.");
  }

  if (plate.status === "ATIVA") {
    throw new PlateServiceError(409, "Placa ja esta ativa.");
  }

  const previousData = mapPlateSummary(plate);

  plate.status = "ATIVA";
  plate.deletedAt = null;
  plate.deletedBy = null;
  plate.responsavel = user.id;

  await plate.save();

  await createPlateMovement({
    plate,
    action: "RESTORE",
    changedBy: user.id,
    previousData,
    newData: mapPlateSummary(plate),
    changes: [
      {
        field: "status",
        from: previousData.status,
        to: plate.status,
      },
      {
        field: "deletedAt",
        from: previousData.deletedAt,
        to: null,
      },
      {
        field: "deletedBy",
        from: previousData.deletedBy,
        to: null,
      },
    ],
  });

  const restoredPlate = await Plate.findById(plate._id)
    .populate("responsavel", "name email")
    .populate("deletedBy", "name email");

  return mapPlateSummary(restoredPlate);
};

const listPlateMovements = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new PlateServiceError(422, "Placa invalida.");
  }

  const plateExists = await Plate.exists({ _id: id });

  if (!plateExists) {
    throw new PlateServiceError(404, "Placa nao encontrada.");
  }

  const movements = await PlateMovement.find({ plateId: id })
    .populate("changedBy", "name email")
    .sort({ changedAt: -1, _id: -1 });

  return movements.map(mapPlateMovement);
};

module.exports = {
  PlateServiceError,
  desactivatePlate,
  createPlate,
  getActivePlateById,
  listActivePlates,
  listInactivePlates,
  listPlateMovements,
  restorePlate,
  updatePlate,
  normalizePlate,
};
