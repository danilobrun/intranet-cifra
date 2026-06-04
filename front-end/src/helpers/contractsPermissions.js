const normalizeText = (value = "") =>
  String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export const getUserRoles = (user) =>
  Array.isArray(user?.roles) ? user.roles : [];

export const roleIsAdmin = (role) => {
  const code = normalizeText(role?.code || role);
  const cargo = normalizeText(role?.cargo);

  return code === "1" || cargo === "admin" || cargo === "administrador";
};

export const roleIsCeo = (role) => {
  const code = normalizeText(role?.code || role);
  const cargo = normalizeText(role?.cargo);

  return code === "ceo" || cargo === "ceo";
};

export const roleIsGerente = (role) => {
  const code = normalizeText(role?.code || role);
  const cargo = normalizeText(role?.cargo);

  return code.includes("gerente") || code.startsWith("2-") || cargo.includes("gerente");
};

export const canManageAllContracts = (user) =>
  getUserRoles(user).some((role) => roleIsAdmin(role) || roleIsCeo(role));

export const canAccessContracts = (user) =>
  getUserRoles(user).some(
    (role) => roleIsAdmin(role) || roleIsCeo(role) || roleIsGerente(role),
  );

export const userIsContractManager = (user) =>
  getUserRoles(user).some((role) => roleIsGerente(role));
