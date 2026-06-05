const brazilStateAbbreviations = {
  Acre: "AC",
  Alagoas: "AL",
  Amapá: "AP",
  Amazonas: "AM",
  Bahia: "BA",
  Ceará: "CE",
  "Distrito Federal": "DF",
  "Espírito Santo": "ES",
  Goiás: "GO",
  Maranhão: "MA",
  "Mato Grosso": "MT",
  "Mato Grosso do Sul": "MS",
  "Minas Gerais": "MG",
  Pará: "PA",
  Paraíba: "PB",
  Paraná: "PR",
  Pernambuco: "PE",
  Piauí: "PI",
  "Rio de Janeiro": "RJ",
  "Rio Grande do Norte": "RN",
  "Rio Grande do Sul": "RS",
  Rondônia: "RO",
  Roraima: "RR",
  "Santa Catarina": "SC",
  "São Paulo": "SP",
  Sergipe: "SE",
  Tocantins: "TO",
};

const isNumber = (value) => typeof value === "number" && Number.isFinite(value);

const formatNumber = (value, options = {}) => {
  if (!isNumber(value)) {
    return "Não informado";
  }

  return new Intl.NumberFormat("pt-BR", options).format(value);
};

export const formatTemperature = (value) => {
  if (!isNumber(value)) {
    return "Não informado";
  }

  return `${Math.round(value)}°C`;
};

export const formatPercent = (value) => {
  if (!isNumber(value)) {
    return "Não informado";
  }

  return `${Math.round(value)}%`;
};

export const formatMillimeters = (value) => {
  if (!isNumber(value)) {
    return "Não informado";
  }

  return `${formatNumber(value, {
    minimumFractionDigits: value > 0 && value < 1 ? 1 : 0,
    maximumFractionDigits: 1,
  })} mm`;
};

export const formatWindSpeed = (value) => {
  if (!isNumber(value)) {
    return "Não informado";
  }

  return `${formatNumber(value, { maximumFractionDigits: 0 })} km/h`;
};

export const formatPressure = (value) => {
  if (!isNumber(value)) {
    return "Não informado";
  }

  return `${formatNumber(value, { maximumFractionDigits: 0 })} hPa`;
};

export const formatVisibility = (value) => {
  if (!isNumber(value)) {
    return "Não informado";
  }

  return `${formatNumber(value / 1000, {
    minimumFractionDigits: value < 10000 ? 1 : 0,
    maximumFractionDigits: 1,
  })} km`;
};

export const formatHour = (value) => {
  if (!value) {
    return "--";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

export const formatUpdatedAt = (value) => {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

export const formatLocationName = (location) => {
  if (!location?.name) {
    return "Localidade não informada";
  }

  const state = brazilStateAbbreviations[location.admin1] || location.admin1;
  return state ? `${location.name}, ${state}` : location.name;
};

export const formatLocationOption = (location) => {
  if (!location?.name) {
    return "";
  }

  const city = formatLocationName(location);
  return location.admin2 && location.admin2 !== location.name
    ? `${city} (${location.admin2})`
    : city;
};
