import { toDateKey } from "./calendar";

const DEFAULT_START_TIME = "09:00";
const DEFAULT_END_TIME = "10:00";
const ALLOWED_VISIBILITY_VALUES = ["PUBLICO", "PESSOAL", "DIRETORIA_ADMIN"];

const normalizeVisibilityValue = (value) =>
  ALLOWED_VISIBILITY_VALUES.includes(value) ? value : "PUBLICO";

const toTimeInputValue = (value, fallbackTime) => {
  if (!value || /^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
    return fallbackTime;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return fallbackTime;
  }

  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${hour}:${minute}`;
};

const toDateInputValue = (value) => {
  if (!value) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
    return String(value);
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "" : toDateKey(date);
};

const parseDateParts = (dateValue) => {
  const [year, month, day] = dateValue.split("-").map(Number);

  return {
    year,
    month: month - 1,
    day,
  };
};

const parseTimeParts = (timeValue, fallbackTime) => {
  const [hour, minute] = (timeValue || fallbackTime).split(":").map(Number);

  return {
    hour,
    minute,
  };
};

const buildLocalDate = (
  dateValue,
  timeValue,
  { fallbackTime = "00:00", endOfDay = false } = {},
) => {
  const { year, month, day } = parseDateParts(dateValue);

  if (endOfDay) {
    return new Date(year, month, day, 23, 59, 59, 999);
  }

  const { hour, minute } = parseTimeParts(timeValue, fallbackTime);

  return new Date(year, month, day, hour, minute, 0, 0);
};

export const getDefaultEventFormData = (date = new Date()) => {
  const dateKey = toDateKey(date);

  return {
    titulo: "",
    descricao: "",
    dataInicio: dateKey,
    horaInicio: DEFAULT_START_TIME,
    dataFim: dateKey,
    horaFim: DEFAULT_END_TIME,
    diaInteiro: false,
    local: "",
    visibilidade: "PUBLICO",
    status: "ATIVO",
  };
};

export const getEventFormDataFromEvent = (event) => ({
  titulo: event?.titulo || "",
  descricao: event?.descricao || "",
  dataInicio: toDateInputValue(event?.dataInicioOriginal || event?.dataInicio),
  horaInicio: toTimeInputValue(
    event?.dataInicioOriginal,
    event?.horaInicio || DEFAULT_START_TIME,
  ),
  dataFim: toDateInputValue(event?.dataFimOriginal || event?.dataFim),
  horaFim: toTimeInputValue(
    event?.dataFimOriginal,
    event?.horaFim || DEFAULT_END_TIME,
  ),
  diaInteiro: Boolean(event?.diaInteiro),
  local: event?.local || "",
  visibilidade: normalizeVisibilityValue(event?.visibilidade),
  status: event?.status || "ATIVO",
});

export const buildAgendaEventPayload = (formData) => {
  const startDate = formData.diaInteiro
    ? buildLocalDate(formData.dataInicio, undefined)
    : buildLocalDate(formData.dataInicio, formData.horaInicio, {
        fallbackTime: DEFAULT_START_TIME,
      });
  const endDate = formData.diaInteiro
    ? buildLocalDate(formData.dataFim, undefined, { endOfDay: true })
    : buildLocalDate(formData.dataFim, formData.horaFim, {
        fallbackTime: DEFAULT_END_TIME,
      });

  return {
    titulo: formData.titulo.trim(),
    descricao: formData.descricao.trim(),
    dataInicio: startDate.toISOString(),
    dataFim: endDate.toISOString(),
    diaInteiro: formData.diaInteiro,
    local: formData.local.trim(),
    visibilidade: formData.visibilidade,
    status: formData.status,
  };
};

export const validateAgendaEventForm = (formData) => {
  if (!formData.titulo.trim()) {
    return "Informe o título do evento.";
  }

  if (!formData.dataInicio) {
    return "Informe a data inicial do evento.";
  }

  if (!formData.dataFim) {
    return "Informe a data final do evento.";
  }

  const payload = buildAgendaEventPayload(formData);

  if (new Date(payload.dataFim) < new Date(payload.dataInicio)) {
    return "A data final não pode ser menor que a data inicial.";
  }

  return "";
};
