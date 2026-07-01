const normalizeCentroCustoNome = (value) => {
  if (value === null || value === undefined) return "";

  return String(value).trim().replace(/\s+/g, " ");
};

const normalizeCentroCustoKey = (value) =>
  normalizeCentroCustoNome(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");

module.exports = {
  normalizeCentroCustoKey,
  normalizeCentroCustoNome,
};
