const normalizeText = (value = "") =>
  String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export const getUserRoles = (user) =>
  Array.isArray(user?.roles) ? user.roles : [];

export const roleIsResumoContratosAdmin = (role) => {
  const code = normalizeText(role?.code || role);
  const cargo = normalizeText(role?.cargo);

  return code === "1" || cargo === "admin" || cargo === "administrador";
};

export const roleIsResumoContratosDono = (role) => {
  const code = normalizeText(role?.code || role);
  const cargo = normalizeText(role?.cargo);

  return code === "dono" || cargo === "dono";
};

export const canAccessResumoContratos = (user) =>
  getUserRoles(user).some(
    (role) =>
      roleIsResumoContratosAdmin(role) || roleIsResumoContratosDono(role),
  );

export const canReactivateResumoContratos = (user) =>
  getUserRoles(user).some(
    (role) => normalizeText(role?.code || role) === "1",
  );
