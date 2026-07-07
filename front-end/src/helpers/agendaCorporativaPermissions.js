const normalizeText = (value = "") =>
  String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const getUserRoles = (user) => (Array.isArray(user?.roles) ? user.roles : []);

const getUserId = (user) => String(user?._id || user?.id || "");

const getEventCreatorId = (event) =>
  String(event?.createdBy?._id || event?.createdBy?.id || event?.createdBy || "");

export const isAgendaAdmin = (user) =>
  getUserRoles(user).some((role) => {
    const code = normalizeText(role?.code || role);
    const cargo = normalizeText(role?.cargo);

    return code === "1" || code === "admin" || cargo === "admin" || cargo === "administrador";
  });

export const isAgendaDiretoriaAdmin = (user) => {
  if (isAgendaAdmin(user)) {
    return true;
  }

  return getUserRoles(user).some((role) => {
    const code = normalizeText(role?.code || role);
    const cargo = normalizeText(role?.cargo);

    return (
      code === "ceo" ||
      code === "dono" ||
      code === "diretoria" ||
      code === "diretor" ||
      code === "diretora" ||
      cargo === "ceo" ||
      cargo === "dono" ||
      cargo === "diretoria" ||
      cargo === "diretor" ||
      cargo === "diretora"
    );
  });
};

export const canEditAgendaEvent = (user, event) => {
  const userId = getUserId(user);
  const creatorId = getEventCreatorId(event);

  if (!userId || !event) {
    return false;
  }

  if (event.visibilidade === "PESSOAL") {
    return Boolean(creatorId && creatorId === userId);
  }

  return isAgendaAdmin(user) || (creatorId && creatorId === userId);
};

export const canDeleteAgendaEvent = canEditAgendaEvent;
