import { downloadCsv, normalizeCsvFileName } from "./csvExport";

const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};

const getUserLabel = (user) => {
  if (!user) return "";
  if (typeof user === "string") return user;

  return user.name || user.email || "";
};

const getCsvValue = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return value;
};

const getDateSuffix = () => new Date().toISOString().slice(0, 10);

const activePlateColumns = [
  ["Placa", (plate) => plate.placa],
  ["Condutor", (plate) => plate.condutor],
  ["Contrato", (plate) => plate.contrato],
  ["Estado", (plate) => plate.estado],
  ["CRLV", (plate) => plate.crlv],
  ["Status", (plate) => plate.status],
  ["Responsável", (plate) => getUserLabel(plate.responsavel)],
  ["Criada em", (plate) => formatDate(plate.createdAt)],
  ["Última atualização", (plate) => formatDate(plate.updatedAt)],
];

const inactivePlateColumns = [
  ["Placa", (plate) => plate.placa],
  ["Condutor", (plate) => plate.condutor],
  ["Contrato", (plate) => plate.contrato],
  ["Estado", (plate) => plate.estado],
  ["CRLV", (plate) => plate.crlv],
  ["Status", (plate) => plate.status],
  ["Inativada em", (plate) => formatDate(plate.deletedAt)],
  ["Inativada por", (plate) => getUserLabel(plate.deletedBy)],
  ["Responsável", (plate) => getUserLabel(plate.responsavel)],
  ["Criada em", (plate) => formatDate(plate.createdAt)],
  ["Última atualização", (plate) => formatDate(plate.updatedAt)],
];

const buildRows = (plates, columns) => [
  columns.map(([label]) => label),
  ...plates.map((plate) =>
    columns.map(([, getValue]) => getCsvValue(getValue(plate))),
  ),
];

export const exportActivePlatesCsv = (plates = []) => {
  const fileName = `${normalizeCsvFileName("placas-ativas")}-${getDateSuffix()}.csv`;

  downloadCsv(fileName, buildRows(plates, activePlateColumns));
};

export const exportInactivePlatesCsv = (plates = []) => {
  const fileName = `${normalizeCsvFileName("placas-inativas")}-${getDateSuffix()}.csv`;

  downloadCsv(fileName, buildRows(plates, inactivePlateColumns));
};
