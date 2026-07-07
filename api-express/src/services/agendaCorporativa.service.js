const mongoose = require("mongoose");
const {
  AgendaCorporativaEvento,
  AGENDA_CORPORATIVA_STATUSES,
  AGENDA_CORPORATIVA_VISIBILIDADES,
} = require("../../models/AgendaCorporativaEvento");

class AgendaCorporativaServiceError extends Error {
  constructor(statusCode, msg, details = {}) {
    super(msg);
    this.statusCode = statusCode;
    this.msg = msg;
    this.details = details;
  }
}

const normalizeText = (value) => {
  if (value === null || value === undefined) return "";

  return String(value).trim();
};

const normalizeEnumValue = (value, fallback) =>
  normalizeText(value || fallback).toUpperCase();

const normalizeComparableText = (value = "") =>
  String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const hasPayload = (payload = {}) =>
  payload && typeof payload === "object" && Object.keys(payload).length > 0;

const ensureAuthenticatedUser = (user) => {
  if (!user?.id) {
    throw new AgendaCorporativaServiceError(
      401,
      "Usuario autenticado nao identificado.",
    );
  }
};

const getObjectIdValue = (value) => value?._id || value?.id || value;

const sameObjectId = (firstId, secondId) =>
  String(getObjectIdValue(firstId) || "") ===
  String(getObjectIdValue(secondId) || "");

const isAgendaAdminUser = (user) => {
  const roles = Array.isArray(user?.roles) ? user.roles : [];

  return roles.some((role) => {
    const code = normalizeComparableText(role?.code || role);
    const cargo = normalizeComparableText(role?.cargo);

    return (
      code === "1" ||
      code === "admin" ||
      cargo === "admin" ||
      cargo === "administrador"
    );
  });
};

const isAgendaDiretoriaAdminUser = (user) => {
  if (isAgendaAdminUser(user)) {
    return true;
  }

  const roles = Array.isArray(user?.roles) ? user.roles : [];

  return roles.some((role) => {
    const code = normalizeComparableText(role?.code || role);
    const cargo = normalizeComparableText(role?.cargo);

    return (
      code === "ceo" ||
      code === "dono" ||
      code === "diretoria" ||
      code === "diretor" ||
      code === "diretora" ||
      cargo === "ceo" ||
      cargo === "dono" ||
      cargo === "diretoria" ||
      cargo === "diretor" ||
      cargo === "diretora"
    );
  });
};

const canViewEvento = (user, evento) => {
  const isCreator = sameObjectId(evento?.createdBy, user?.id);

  if (isCreator) {
    return true;
  }

  if (evento?.visibilidade === "PUBLICO") {
    return true;
  }

  if (evento?.visibilidade === "DIRETORIA_ADMIN") {
    return isAgendaDiretoriaAdminUser(user);
  }

  return false;
};

const ensureCanViewEvento = (user, evento) => {
  if (canViewEvento(user, evento)) {
    return;
  }

  throw new AgendaCorporativaServiceError(
    403,
    "Voce nao tem permissao para visualizar este evento.",
  );
};

const ensureCanEditEvento = (user, evento) => {
  const isCreator = sameObjectId(evento?.createdBy, user?.id);

  if (evento?.visibilidade === "PESSOAL") {
    if (isCreator) {
      return;
    }

    throw new AgendaCorporativaServiceError(
      403,
      "Voce nao tem permissao para editar este evento.",
    );
  }

  if (isAgendaAdminUser(user) || isCreator) {
    return;
  }

  throw new AgendaCorporativaServiceError(
    403,
    "Voce nao tem permissao para editar este evento.",
  );
};

const ensureCanDeleteEvento = (user, evento) => {
  const isCreator = sameObjectId(evento?.createdBy, user?.id);

  if (evento?.visibilidade === "PESSOAL") {
    if (isCreator) {
      return;
    }

    throw new AgendaCorporativaServiceError(
      403,
      "Voce nao tem permissao para excluir este evento.",
    );
  }

  if (isAgendaAdminUser(user) || isCreator) {
    return;
  }

  throw new AgendaCorporativaServiceError(
    403,
    "Voce nao tem permissao para excluir este evento.",
  );
};

const validateObjectId = (id, message) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AgendaCorporativaServiceError(422, message);
  }
};

const parseDate = (value, fieldName) => {
  if (!value) {
    throw new AgendaCorporativaServiceError(422, `${fieldName} e obrigatoria.`);
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new AgendaCorporativaServiceError(
      422,
      `${fieldName} deve ser uma data valida.`,
    );
  }

  return date;
};

const parseOptionalDate = (value, fieldName, boundary) => {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new AgendaCorporativaServiceError(
      422,
      `${fieldName} deve ser uma data valida.`,
    );
  }

  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(String(value));

  if (isDateOnly && boundary === "start") {
    date.setUTCHours(0, 0, 0, 0);
  }

  if (isDateOnly && boundary === "end") {
    date.setUTCHours(23, 59, 59, 999);
  }

  return date;
};

const ensureEnumValue = (value, allowedValues, fieldName) => {
  if (!allowedValues.includes(value)) {
    throw new AgendaCorporativaServiceError(
      422,
      `${fieldName} deve respeitar os valores permitidos.`,
      {
        allowedValues,
      },
    );
  }

  return value;
};

const ensureRequiredText = (value, fieldName) => {
  const normalizedValue = normalizeText(value);

  if (!normalizedValue) {
    throw new AgendaCorporativaServiceError(422, `${fieldName} e obrigatorio.`);
  }

  return normalizedValue;
};

const getAllowedVisibilityOrDefault = (value) =>
  AGENDA_CORPORATIVA_VISIBILIDADES.includes(value) ? value : "PUBLICO";

const ensureCanUseEventoVisibility = (user, visibilidade) => {
  if (visibilidade !== "DIRETORIA_ADMIN" || isAgendaDiretoriaAdminUser(user)) {
    return;
  }

  throw new AgendaCorporativaServiceError(
    403,
    "Apenas usuarios da diretoria ou administradores podem usar esta visibilidade.",
  );
};

const buildVisibilityAccessFilter = (user) => {
  const visibleValues = ["PUBLICO"];

  if (isAgendaDiretoriaAdminUser(user)) {
    visibleValues.push("DIRETORIA_ADMIN");
  }

  return {
    $or: [
      { visibilidade: { $in: visibleValues } },
      { createdBy: user.id },
    ],
  };
};

const buildPayload = (payload = {}, user, currentEvent = null) => {
  if (!hasPayload(payload)) {
    throw new AgendaCorporativaServiceError(
      422,
      "Dados invalidos para o evento.",
    );
  }

  const titulo =
    payload.titulo !== undefined
      ? ensureRequiredText(payload.titulo, "titulo")
      : currentEvent?.titulo;
  const dataInicio =
    payload.dataInicio !== undefined
      ? parseDate(payload.dataInicio, "dataInicio")
      : currentEvent?.dataInicio;
  const dataFim =
    payload.dataFim !== undefined
      ? parseDate(payload.dataFim, "dataFim")
      : currentEvent?.dataFim;
  const visibilidade =
    payload.visibilidade !== undefined
      ? ensureEnumValue(
          normalizeEnumValue(payload.visibilidade),
          AGENDA_CORPORATIVA_VISIBILIDADES,
          "visibilidade",
        )
      : getAllowedVisibilityOrDefault(currentEvent?.visibilidade);
  const status =
    payload.status !== undefined
      ? ensureEnumValue(
          normalizeEnumValue(payload.status),
          AGENDA_CORPORATIVA_STATUSES,
          "status",
        )
      : currentEvent?.status || "ATIVO";

  ensureCanUseEventoVisibility(user, visibilidade);

  if (!titulo) {
    throw new AgendaCorporativaServiceError(422, "titulo e obrigatorio.");
  }

  if (!dataInicio) {
    throw new AgendaCorporativaServiceError(422, "dataInicio e obrigatoria.");
  }

  if (!dataFim) {
    throw new AgendaCorporativaServiceError(422, "dataFim e obrigatoria.");
  }

  if (dataFim < dataInicio) {
    throw new AgendaCorporativaServiceError(
      422,
      "dataFim nao pode ser menor que dataInicio.",
    );
  }

  return {
    titulo,
    descricao:
      payload.descricao !== undefined
        ? normalizeText(payload.descricao)
        : currentEvent?.descricao || "",
    dataInicio,
    dataFim,
    diaInteiro:
      payload.diaInteiro !== undefined
        ? Boolean(payload.diaInteiro)
        : Boolean(currentEvent?.diaInteiro),
    local:
      payload.local !== undefined
        ? normalizeText(payload.local)
        : currentEvent?.local || "",
    visibilidade,
    status,
    ...(currentEvent
      ? {
          updatedBy: user.id,
        }
      : {
          createdBy: user.id,
        }),
  };
};

const mapUser = (user) => {
  if (!user) return null;

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
  };
};

const mapEvento = (evento) => ({
  _id: evento._id,
  titulo: evento.titulo,
  descricao: evento.descricao,
  dataInicio: evento.dataInicio,
  dataFim: evento.dataFim,
  diaInteiro: evento.diaInteiro,
  local: evento.local,
  visibilidade: evento.visibilidade,
  status: evento.status,
  createdBy: mapUser(evento.createdBy),
  updatedBy: mapUser(evento.updatedBy),
  createdAt: evento.createdAt,
  updatedAt: evento.updatedAt,
});

const agendaEventoPopulateConfig = [
  { path: "createdBy", select: "_id name email" },
  { path: "updatedBy", select: "_id name email" },
];

const buildListFilters = (query = {}, user) => {
  const filters = {};
  const start = parseOptionalDate(query.start, "start", "start");
  const end = parseOptionalDate(query.end, "end", "end");
  const status = normalizeText(query.status);
  const visibilidade = normalizeText(query.visibilidade);

  if (start && end && end < start) {
    throw new AgendaCorporativaServiceError(
      422,
      "end nao pode ser menor que start.",
    );
  }

  if (start || end) {
    if (end) {
      filters.dataInicio = { ...(filters.dataInicio || {}), $lte: end };
    }

    if (start) {
      filters.dataFim = { ...(filters.dataFim || {}), $gte: start };
    }
  }

  if (status) {
    filters.status = ensureEnumValue(
      normalizeEnumValue(status),
      AGENDA_CORPORATIVA_STATUSES,
      "status",
    );
  }

  if (visibilidade) {
    filters.visibilidade = ensureEnumValue(
      normalizeEnumValue(visibilidade),
      AGENDA_CORPORATIVA_VISIBILIDADES,
      "visibilidade",
    );
  }

  return {
    ...filters,
    ...buildVisibilityAccessFilter(user),
  };
};

const listAgendaCorporativaEventos = async (query = {}, user) => {
  ensureAuthenticatedUser(user);

  const filters = buildListFilters(query, user);
  const eventos = await AgendaCorporativaEvento.find(filters)
    .populate(agendaEventoPopulateConfig)
    .collation({ locale: "pt", strength: 1, numericOrdering: true })
    .sort({ dataInicio: 1, titulo: 1 });

  return {
    eventos: eventos.map(mapEvento),
  };
};

const getAgendaCorporativaEventoById = async (id, user) => {
  ensureAuthenticatedUser(user);
  validateObjectId(id, "Evento invalido.");

  const evento = await AgendaCorporativaEvento.findById(id).populate(
    agendaEventoPopulateConfig,
  );

  if (!evento) {
    throw new AgendaCorporativaServiceError(404, "Evento nao encontrado.");
  }

  ensureCanViewEvento(user, evento);

  return mapEvento(evento);
};

const createAgendaCorporativaEvento = async (payload = {}, user) => {
  ensureAuthenticatedUser(user);

  const createPayload = buildPayload(payload, user);
  const evento = await AgendaCorporativaEvento.create(createPayload);
  const createdEvento = await AgendaCorporativaEvento.findById(
    evento._id,
  ).populate(agendaEventoPopulateConfig);

  return mapEvento(createdEvento);
};

const updateAgendaCorporativaEvento = async (id, payload = {}, user) => {
  ensureAuthenticatedUser(user);
  validateObjectId(id, "Evento invalido.");

  const evento = await AgendaCorporativaEvento.findById(id);

  if (!evento) {
    throw new AgendaCorporativaServiceError(404, "Evento nao encontrado.");
  }

  ensureCanEditEvento(user, evento);

  const updatePayload = buildPayload(payload, user, evento);

  Object.assign(evento, updatePayload);
  await evento.save();

  const updatedEvento = await AgendaCorporativaEvento.findById(
    evento._id,
  ).populate(agendaEventoPopulateConfig);

  return mapEvento(updatedEvento);
};

const deleteAgendaCorporativaEvento = async (id, user) => {
  ensureAuthenticatedUser(user);
  validateObjectId(id, "Evento invalido.");

  const evento = await AgendaCorporativaEvento.findById(id);

  if (!evento) {
    throw new AgendaCorporativaServiceError(404, "Evento nao encontrado.");
  }

  ensureCanDeleteEvento(user, evento);

  await AgendaCorporativaEvento.deleteOne({ _id: evento._id });

  return {
    _id: evento._id,
    titulo: evento.titulo,
  };
};

module.exports = {
  AgendaCorporativaServiceError,
  createAgendaCorporativaEvento,
  deleteAgendaCorporativaEvento,
  getAgendaCorporativaEventoById,
  listAgendaCorporativaEventos,
  updateAgendaCorporativaEvento,
};
