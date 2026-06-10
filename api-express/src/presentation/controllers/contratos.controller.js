const mongoose = require("mongoose");
const Contrato = require("../../../models/Contrato");
const User = require("../../../models/User");

const STATUS_ACTIVE = "Ativo";
const STATUS_INACTIVE = "Inativo";
const CONTRATO_STATUSES = [STATUS_ACTIVE, STATUS_INACTIVE];
const CONTRATO_ESTADOS = ["Pernambuco", "Sergipe", "Alagoas", "Piau\u00ed"];
const USER_PUBLIC_SELECT = "_id name";
const MANAGER_USER_SELECT = "_id name roles";

const contratoPopulateConfig = [
  { path: "gestorId", select: USER_PUBLIC_SELECT },
  { path: "createdBy", select: USER_PUBLIC_SELECT },
  { path: "updatedBy", select: USER_PUBLIC_SELECT },
  { path: "inactivatedBy", select: USER_PUBLIC_SELECT },
  { path: "reactivatedBy", select: USER_PUBLIC_SELECT },
];

const normalizeText = (value = "") =>
  String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const getText = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value !== "string") {
    return null;
  }

  return value.trim();
};

const getIdText = (value) => {
  if (value && typeof value === "object" && value._id) {
    return String(value._id).trim();
  }

  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const sameObjectId = (left, right) => getIdText(left) === getIdText(right);

const mapUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    _id: user._id,
    name: user.name,
  };
};

const mapContratoResponse = (contrato) => ({
  _id: contrato._id,
  codigo: contrato.codigo,
  nomeContrato: contrato.nomeContrato,
  cliente: contrato.cliente,
  estado: contrato.estado,
  descricao: contrato.descricao || "",
  gestorId: mapUser(contrato.gestorId),
  dataInicio: contrato.dataInicio,
  dataFim: contrato.dataFim,
  status: contrato.status,
  createdBy: mapUser(contrato.createdBy),
  createdAt: contrato.createdAt,
  updatedBy: mapUser(contrato.updatedBy),
  updatedAt: contrato.updatedAt,
  inactivatedBy: mapUser(contrato.inactivatedBy),
  inactivatedAt: contrato.inactivatedAt,
  reactivatedBy: mapUser(contrato.reactivatedBy),
  reactivatedAt: contrato.reactivatedAt,
});

const normalizeEstado = (value) => {
  const normalizedValue = normalizeText(value);

  return CONTRATO_ESTADOS.find(
    (estado) => normalizeText(estado) === normalizedValue,
  );
};

const normalizeStatus = (value) => {
  const normalizedValue = normalizeText(value);

  return CONTRATO_STATUSES.find(
    (status) => normalizeText(status) === normalizedValue,
  );
};

const roleMatches = (role, matcher) => {
  const code = normalizeText(role?.code);
  const cargo = normalizeText(role?.cargo);

  return matcher({ code, cargo });
};

const hasAdminRole = (roles = []) =>
  roles.some((role) =>
    roleMatches(role, ({ code, cargo }) =>
      code === "1" || cargo === "admin" || cargo === "administrador",
    ),
  );

const hasCeoRole = (roles = []) =>
  roles.some((role) =>
    roleMatches(role, ({ code, cargo }) => code === "ceo" || cargo === "ceo"),
  );

const hasGerenteRole = (roles = []) =>
  roles.some((role) =>
    roleMatches(
      role,
      ({ code, cargo }) => code.includes("gerente") || cargo.includes("gerente"),
    ),
  );

const getCurrentUserProfile = async (req) => {
  const user = await User.findById(req.user?.id).populate("roles");

  if (!user) {
    return {
      ok: false,
      status: 401,
      msg: "Usuario nao encontrado.",
    };
  }

  const roles = Array.isArray(user.roles) ? user.roles : [];
  const canManageAll = hasAdminRole(roles) || hasCeoRole(roles);
  const isGerente = hasGerenteRole(roles);

  if (!canManageAll && !isGerente) {
    return {
      ok: false,
      status: 403,
      msg: "Acesso negado.",
    };
  }

  return {
    ok: true,
    user,
    canManageAll,
    isGerente,
  };
};

const mapManagerResponse = (user) => ({
  _id: user._id,
  name: user.name,
});

const listContractManagers = async (req, res) => {
  try {
    const profile = await getCurrentUserProfile(req);
    if (!profile.ok) {
      return res.status(profile.status).json({ msg: profile.msg });
    }

    if (!profile.canManageAll) {
      return res.status(403).json({ msg: "Acesso negado." });
    }

    const users = await User.find()
      .select(MANAGER_USER_SELECT)
      .populate({ path: "roles", select: "_id code cargo" })
      .sort({ name: 1 });

    const managers = users
      .filter((user) => hasGerenteRole(user.roles))
      .map(mapManagerResponse);

    return res.status(200).json(managers);
  } catch (error) {
    console.log("listContractManagers error", error);
    return res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

const parseRequiredDate = (value, fieldLabel) => {
  if (!value) {
    return {
      ok: false,
      msg: `${fieldLabel} e obrigatoria.`,
    };
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return {
      ok: false,
      msg: `${fieldLabel} invalida.`,
    };
  }

  return {
    ok: true,
    value: date,
  };
};

const parseOptionalDate = (value, fieldLabel) => {
  if (value === undefined || value === null || value === "") {
    return {
      ok: true,
      value: null,
    };
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return {
      ok: false,
      msg: `${fieldLabel} invalida.`,
    };
  }

  return {
    ok: true,
    value: date,
  };
};

const getRequiredString = (body, fieldName, fieldLabel) => {
  const value = getText(body?.[fieldName]);

  if (value === null) {
    return {
      ok: false,
      msg: `${fieldLabel} precisa ser texto.`,
    };
  }

  if (!value) {
    return {
      ok: false,
      msg: `${fieldLabel} e obrigatorio.`,
    };
  }

  return {
    ok: true,
    value,
  };
};

const getOptionalString = (body, fieldName, fieldLabel) => {
  const value = getText(body?.[fieldName]);

  if (value === null) {
    return {
      ok: false,
      msg: `${fieldLabel} precisa ser texto.`,
    };
  }

  return {
    ok: true,
    value,
  };
};

const getGestorIdFromBody = (body, profile) => {
  const gestorId = getIdText(body?.gestorId);

  if (!profile.canManageAll) {
    if (gestorId && !sameObjectId(gestorId, profile.user._id)) {
      return {
        ok: false,
        status: 403,
        msg: "Gerente nao pode informar outro usuario como gestor.",
      };
    }

    return {
      ok: true,
      value: String(profile.user._id),
    };
  }

  if (!gestorId) {
    return {
      ok: false,
      status: 422,
      msg: "O gestor e obrigatorio.",
    };
  }

  if (!mongoose.Types.ObjectId.isValid(gestorId)) {
    return {
      ok: false,
      status: 422,
      msg: "Gestor invalido.",
    };
  }

  return {
    ok: true,
    value: gestorId,
  };
};

const validateGestor = async (gestorId) => {
  const gestor = await User.findById(gestorId).populate("roles");

  if (!gestor) {
    return {
      ok: false,
      status: 422,
      msg: "Gestor nao encontrado.",
    };
  }

  if (!hasGerenteRole(gestor.roles)) {
    return {
      ok: false,
      status: 422,
      msg: "Gestor precisa ter perfil Gerente.",
    };
  }

  return {
    ok: true,
    gestor,
  };
};

const getContratoPayload = (body = {}, profile, options = {}) => {
  const codigoResult = getRequiredString(body, "codigo", "O codigo");
  if (!codigoResult.ok) return codigoResult;

  const nomeContratoResult = getRequiredString(
    body,
    "nomeContrato",
    "O nome do contrato",
  );
  if (!nomeContratoResult.ok) return nomeContratoResult;

  const clienteResult = getRequiredString(body, "cliente", "O cliente");
  if (!clienteResult.ok) return clienteResult;

  const estadoResult = getRequiredString(body, "estado", "O estado");
  if (!estadoResult.ok) return estadoResult;

  const estado = normalizeEstado(estadoResult.value);
  if (!estado) {
    return {
      ok: false,
      status: 422,
      msg: "Estado invalido para contrato.",
    };
  }

  const descricaoResult = getOptionalString(body, "descricao", "A descricao");
  if (!descricaoResult.ok) return descricaoResult;

  const gestorResult = getGestorIdFromBody(body, profile);
  if (!gestorResult.ok) return gestorResult;

  const dataInicioResult = parseRequiredDate(body.dataInicio, "Data de inicio");
  if (!dataInicioResult.ok) return dataInicioResult;

  const dataFimResult = parseOptionalDate(body.dataFim, "Data de fim");
  if (!dataFimResult.ok) return dataFimResult;

  if (body.status !== undefined && body.status !== null && body.status !== "") {
    const status = normalizeStatus(body.status);

    if (!status) {
      return {
        ok: false,
        status: 422,
        msg: "Status de contrato invalido.",
      };
    }

    if (options.currentStatus && status !== options.currentStatus) {
      return {
        ok: false,
        status: 422,
        msg: "Atualize o status pela acao propria de status do contrato.",
      };
    }

    if (options.isCreate && status !== STATUS_ACTIVE) {
      return {
        ok: false,
        status: 422,
        msg: "Contrato deve ser criado como Ativo.",
      };
    }
  }

  return {
    ok: true,
    payload: {
      codigo: codigoResult.value,
      nomeContrato: nomeContratoResult.value,
      cliente: clienteResult.value,
      estado,
      descricao: descricaoResult.value,
      gestorId: gestorResult.value,
      dataInicio: dataInicioResult.value,
      dataFim: dataFimResult.value,
    },
  };
};

const findContratoById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return {
      ok: false,
      status: 422,
      msg: "Contrato invalido.",
    };
  }

  const contrato = await Contrato.findById(id).populate(contratoPopulateConfig);

  if (!contrato) {
    return {
      ok: false,
      status: 404,
      msg: "Contrato nao encontrado.",
    };
  }

  return {
    ok: true,
    contrato,
  };
};

const canAccessContrato = (profile, contrato) =>
  profile.canManageAll || sameObjectId(contrato.gestorId, profile.user._id);

const getStatusFilter = (status) => {
  const statusText = getText(status);

  if (!statusText) {
    return {
      ok: true,
      filter: { status: STATUS_ACTIVE },
    };
  }

  const normalizedStatus = normalizeText(statusText);

  if (normalizedStatus === "todos" || normalizedStatus === "all") {
    return {
      ok: true,
      filter: {},
    };
  }

  const statusValue = normalizeStatus(statusText);

  if (!statusValue) {
    return {
      ok: false,
      status: 422,
      msg: "Status de contrato invalido.",
    };
  }

  return {
    ok: true,
    filter: { status: statusValue },
  };
};

const getListFilter = (query = {}, profile) => {
  const statusResult = getStatusFilter(query.status);
  if (!statusResult.ok) return statusResult;

  const filter = {
    ...statusResult.filter,
  };

  const search = getText(query.q || query.search || query.nomeContrato);
  if (search === null) {
    return {
      ok: false,
      status: 422,
      msg: "Busca por nome do contrato invalida.",
    };
  }

  if (search) {
    filter.nomeContrato = new RegExp(escapeRegex(search), "i");
  }

  const codigo = getText(query.codigo);
  if (codigo === null) {
    return {
      ok: false,
      status: 422,
      msg: "Filtro de codigo invalido.",
    };
  }

  if (codigo) {
    filter.codigo = new RegExp(`^${escapeRegex(codigo)}$`, "i");
  }

  const cliente = getText(query.cliente);
  if (cliente === null) {
    return {
      ok: false,
      status: 422,
      msg: "Filtro de cliente invalido.",
    };
  }

  if (cliente) {
    filter.cliente = new RegExp(`^${escapeRegex(cliente)}$`, "i");
  }

  const estadoText = getText(query.estado);
  if (estadoText === null) {
    return {
      ok: false,
      status: 422,
      msg: "Filtro de estado invalido.",
    };
  }

  if (estadoText) {
    const estado = normalizeEstado(estadoText);

    if (!estado) {
      return {
        ok: false,
        status: 422,
        msg: "Estado invalido para contrato.",
      };
    }

    filter.estado = estado;
  }

  if (profile.canManageAll) {
    const gestorId = getIdText(query.gestorId || query.gestor);

    if (gestorId) {
      if (!mongoose.Types.ObjectId.isValid(gestorId)) {
        return {
          ok: false,
          status: 422,
          msg: "Filtro de gestor invalido.",
        };
      }

      filter.gestorId = gestorId;
    }
  } else {
    filter.gestorId = profile.user._id;
  }

  return {
    ok: true,
    filter,
  };
};

const listContratos = async (req, res) => {
  try {
    const profile = await getCurrentUserProfile(req);
    if (!profile.ok) {
      return res.status(profile.status).json({ msg: profile.msg });
    }

    const filterResult = getListFilter(req.query, profile);
    if (!filterResult.ok) {
      return res.status(filterResult.status).json({ msg: filterResult.msg });
    }

    const contratos = await Contrato.find(filterResult.filter)
      .populate(contratoPopulateConfig)
      .sort({ updatedAt: -1 });

    return res.status(200).json(contratos.map(mapContratoResponse));
  } catch (error) {
    console.log("listContratos error", error);
    return res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

const listContratoById = async (req, res) => {
  try {
    const profile = await getCurrentUserProfile(req);
    if (!profile.ok) {
      return res.status(profile.status).json({ msg: profile.msg });
    }

    const result = await findContratoById(req.params.id);
    if (!result.ok) {
      return res.status(result.status).json({ msg: result.msg });
    }

    if (!canAccessContrato(profile, result.contrato)) {
      return res.status(403).json({ msg: "Acesso negado." });
    }

    return res.status(200).json(mapContratoResponse(result.contrato));
  } catch (error) {
    console.log("listContratoById error", error);
    return res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

const createContrato = async (req, res) => {
  try {
    const profile = await getCurrentUserProfile(req);
    if (!profile.ok) {
      return res.status(profile.status).json({ msg: profile.msg });
    }

    const payloadResult = getContratoPayload(req.body, profile, {
      isCreate: true,
    });

    if (!payloadResult.ok) {
      return res
        .status(payloadResult.status || 422)
        .json({ msg: payloadResult.msg });
    }

    const gestorResult = await validateGestor(payloadResult.payload.gestorId);
    if (!gestorResult.ok) {
      return res.status(gestorResult.status).json({ msg: gestorResult.msg });
    }

    const contrato = new Contrato({
      ...payloadResult.payload,
      status: STATUS_ACTIVE,
      createdBy: profile.user._id,
      updatedBy: profile.user._id,
    });

    await contrato.save();
    await contrato.populate(contratoPopulateConfig);

    return res.status(201).json({
      msg: "Contrato criado com sucesso.",
      contrato: mapContratoResponse(contrato),
    });
  } catch (error) {
    console.log("createContrato error", error);
    return res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

const editContrato = async (req, res) => {
  try {
    const profile = await getCurrentUserProfile(req);
    if (!profile.ok) {
      return res.status(profile.status).json({ msg: profile.msg });
    }

    const findResult = await findContratoById(req.params.id);
    if (!findResult.ok) {
      return res.status(findResult.status).json({ msg: findResult.msg });
    }

    const contrato = findResult.contrato;

    if (!canAccessContrato(profile, contrato)) {
      return res.status(403).json({ msg: "Acesso negado." });
    }

    const payloadResult = getContratoPayload(req.body, profile, {
      currentStatus: contrato.status,
    });

    if (!payloadResult.ok) {
      return res
        .status(payloadResult.status || 422)
        .json({ msg: payloadResult.msg });
    }

    const gestorResult = await validateGestor(payloadResult.payload.gestorId);
    if (!gestorResult.ok) {
      return res.status(gestorResult.status).json({ msg: gestorResult.msg });
    }

    contrato.codigo = payloadResult.payload.codigo;
    contrato.nomeContrato = payloadResult.payload.nomeContrato;
    contrato.cliente = payloadResult.payload.cliente;
    contrato.estado = payloadResult.payload.estado;
    contrato.descricao = payloadResult.payload.descricao;
    contrato.gestorId = payloadResult.payload.gestorId;
    contrato.dataInicio = payloadResult.payload.dataInicio;
    contrato.dataFim = payloadResult.payload.dataFim;
    contrato.updatedBy = profile.user._id;

    await contrato.save();
    await contrato.populate(contratoPopulateConfig);

    return res.status(200).json({
      msg: "Contrato atualizado com sucesso.",
      contrato: mapContratoResponse(contrato),
    });
  } catch (error) {
    console.log("editContrato error", error);
    return res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

const updateContratoStatus = async (req, res) => {
  const nextStatus = normalizeStatus(req.body?.status);

  if (!nextStatus) {
    return res.status(422).json({ msg: "Status de contrato invalido." });
  }

  try {
    const profile = await getCurrentUserProfile(req);
    if (!profile.ok) {
      return res.status(profile.status).json({ msg: profile.msg });
    }

    const findResult = await findContratoById(req.params.id);
    if (!findResult.ok) {
      return res.status(findResult.status).json({ msg: findResult.msg });
    }

    const contrato = findResult.contrato;

    if (!canAccessContrato(profile, contrato)) {
      return res.status(403).json({ msg: "Acesso negado." });
    }

    if (contrato.status !== nextStatus) {
      if (nextStatus === STATUS_INACTIVE) {
        contrato.inactivatedBy = profile.user._id;
        contrato.inactivatedAt = new Date();
      }

      if (nextStatus === STATUS_ACTIVE) {
        contrato.reactivatedBy = profile.user._id;
        contrato.reactivatedAt = new Date();
      }
    }

    contrato.status = nextStatus;
    contrato.updatedBy = profile.user._id;

    await contrato.save();
    await contrato.populate(contratoPopulateConfig);

    return res.status(200).json({
      msg: "Status do contrato atualizado com sucesso.",
      contrato: mapContratoResponse(contrato),
    });
  } catch (error) {
    console.log("updateContratoStatus error", error);
    return res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

module.exports = {
  listContractManagers,
  listContratos,
  listContratoById,
  createContrato,
  editContrato,
  updateContratoStatus,
};
