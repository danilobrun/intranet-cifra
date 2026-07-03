const normalizeText = (value = "") =>
  String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const getUserRoles = (user) => (Array.isArray(user?.roles) ? user.roles : []);

const roleCanManageCentroCusto = (role) => {
  const code = normalizeText(role?.code || role);
  const cargo = normalizeText(role?.cargo);

  return (
    code === "1" ||
    code === "admin" ||
    code === "rh" ||
    cargo === "admin" ||
    cargo === "administrador" ||
    cargo === "rh"
  );
};

export const canManageCentrosCusto = (user) =>
  getUserRoles(user).some(roleCanManageCentroCusto);
