export const RESUMO_CONTRATO_MONTH_OPTIONS = [
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" },
];

export const getResumoContratoId = (contrato) => contrato?.id || contrato?._id || "";

export const getResumoContratoName = (contrato) =>
  contrato?.nomeContrato?.trim() || "Contrato sem nome";

export const toNumber = (value, fallback = 0) => {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : fallback;
};

export const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(toNumber(value));

export const formatCurrencyInputValue = (value) => {
  const digits = String(value ?? "").replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  return formatCurrency(Number(digits) / 100);
};

export const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
};

export const formatGap = (value) => {
  if (value === undefined || value === null || value === "") {
    return "—";
  }

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return "—";
  }

  return `${numberValue} dia${numberValue === 1 ? "" : "s"}`;
};

export const buildEmptyBmsPorMes = () =>
  RESUMO_CONTRATO_MONTH_OPTIONS.reduce((accumulator, month) => {
    accumulator[String(month.value)] = 0;
    return accumulator;
  }, {});

export const parseCurrencyInput = (value) => {
  const cleanedValue = String(value || "")
    .trim()
    .replace(/[^\d,.-]/g, "");
  const normalizedValue = cleanedValue.includes(",")
    ? cleanedValue.replace(/\./g, "").replace(",", ".")
    : cleanedValue.replace(/\.(?=\d{3}(?:\.|$))/g, "");

  if (!normalizedValue) {
    return 0;
  }

  return toNumber(normalizedValue, Number.NaN);
};
