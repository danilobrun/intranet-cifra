const normalizeCpf = (cpf) => String(cpf || "").replace(/\D/g, "");

const validateCpf = (cpf) => {
  const normalizedCpf = normalizeCpf(cpf);

  if (!normalizedCpf) {
    return {
      ok: false,
      msg: "O CPF e obrigatorio.",
    };
  }

  if (!/^\d{11}$/.test(normalizedCpf)) {
    return {
      ok: false,
      msg: "Informe um CPF valido com 11 digitos.",
    };
  }

  return {
    ok: true,
    cpf: normalizedCpf,
  };
};

module.exports = {
  normalizeCpf,
  validateCpf,
};
