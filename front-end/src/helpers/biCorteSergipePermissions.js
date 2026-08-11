const BI_CORTE_SERGIPE_ROLE_CODES = new Set(["1", "dono"]);

export const canAccessBiCorteSergipe = (user) =>
  Array.isArray(user?.roles) &&
  user.roles.some((role) =>
    BI_CORTE_SERGIPE_ROLE_CODES.has(String(role?.code || role).trim()),
  );
