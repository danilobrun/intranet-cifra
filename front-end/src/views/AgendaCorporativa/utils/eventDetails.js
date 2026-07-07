import { STATUS_OPTIONS, VISIBILITY_OPTIONS } from "../constants";

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const DATE_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const parseDisplayDate = (value) => {
  if (!value) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
    const [year, month, day] = String(value).split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

const getOptionLabel = (options, value) =>
  options.find((option) => option.value === value)?.label || value || "-";

export const getVisibilityLabel = (value) =>
  getOptionLabel(VISIBILITY_OPTIONS, value);

export const getStatusLabel = (value) => getOptionLabel(STATUS_OPTIONS, value);

export const formatEventPeriod = (event) => {
  const startDate = parseDisplayDate(event?.dataInicioOriginal || event?.dataInicio);
  const endDate = parseDisplayDate(event?.dataFimOriginal || event?.dataFim);

  if (!startDate || !endDate) {
    return "-";
  }

  if (event?.diaInteiro) {
    const startLabel = DATE_FORMATTER.format(startDate);
    const endLabel = DATE_FORMATTER.format(endDate);

    return startLabel === endLabel ? startLabel : `${startLabel} a ${endLabel}`;
  }

  const startLabel = DATE_TIME_FORMATTER.format(startDate);
  const endLabel = DATE_TIME_FORMATTER.format(endDate);

  return startLabel === endLabel ? startLabel : `${startLabel} a ${endLabel}`;
};

export const formatAuditDate = (value) => {
  const date = parseDisplayDate(value);

  return date ? DATE_TIME_FORMATTER.format(date) : "-";
};
