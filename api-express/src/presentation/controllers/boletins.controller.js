const mongoose = require("mongoose");
const Boletim = require("../../../models/Boletim");
const Contrato = require("../../../models/Contrato");
const Faturamento = require("../../../models/Faturamento");
const Pagamento = require("../../../models/Pagamento");
const User = require("../../../models/User");
const createBoletinsLancamentosController = require("./boletinsLancamentos.controller");

const CONTRATO_STATUS_ACTIVE = "Ativo";
const CONTRATO_ESTADOS = ["Pernambuco", "Sergipe", "Alagoas", "Piau\u00ed"];

const STATUS_FATURAMENTO_NAO_FATURADO = "N\u00e3o faturado";
const STATUS_FATURAMENTO_PARCIAL = "Parcialmente Faturado";
const STATUS_FATURAMENTO_FATURADO = "Faturado";
const STATUS_PAGAMENTO_NAO_FATURADO = "N\u00e3o faturado";
const STATUS_PAGAMENTO_NAO_PAGO = "N\u00e3o pago";
const STATUS_PAGAMENTO_PARCIAL = "Parcialmente Pago";
const STATUS_PAGAMENTO_PAGO = "Pago";

const FATURAMENTO_STATUSES = [
  STATUS_FATURAMENTO_NAO_FATURADO,
  STATUS_FATURAMENTO_PARCIAL,
  STATUS_FATURAMENTO_FATURADO,
];

const PAGAMENTO_STATUSES = [
  STATUS_PAGAMENTO_NAO_FATURADO,
  STATUS_PAGAMENTO_NAO_PAGO,
  STATUS_PAGAMENTO_PARCIAL,
  STATUS_PAGAMENTO_PAGO,
];

const boletimPopulateConfig = [
  {
    path: "contratoId",
    select: "_id codigo nomeContrato cliente estado gestorId status",
    populate: {
      path: "gestorId",
      select: "_id name email",
    },
  },
  { path: "createdBy", select: "_id name email" },
  { path: "updatedBy", select: "_id name email" },
  { path: "deletedBy", select: "_id name email" },
];

const notDeletedFilter = {
  $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
};

const deletedFilter = {
  deletedAt: { $exists: true, $ne: null },
};

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

const toObjectId = (id) => new mongoose.Types.ObjectId(getIdText(id));

const toCents = (value) => Math.round(Number(value || 0) * 100);

const fromCents = (value) => Number((value / 100).toFixed(2));

const mapUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
  };
};

const mapContratoResponse = (contrato) => {
  if (!contrato) {
    return null;
  }

  return {
    _id: contrato._id,
    codigo: contrato.codigo,
    nomeContrato: contrato.nomeContrato,
    cliente: contrato.cliente,
    estado: contrato.estado,
    gestorId: mapUser(contrato.gestorId),
    status: contrato.status,
  };
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

const normalizeEstado = (value) => {
  const normalizedValue = normalizeText(value);

  return CONTRATO_ESTADOS.find(
    (estado) => normalizeText(estado) === normalizedValue,
  );
};

const normalizeCalculatedStatus = (value, statuses = []) => {
  const normalizedValue = normalizeText(value);

  return statuses.find((status) => normalizeText(status) === normalizedValue);
};

const parseRequiredNumber = (value, fieldLabel) => {
  if (value === undefined || value === null || value === "") {
    return {
      ok: false,
      msg: `${fieldLabel} e obrigatorio.`,
    };
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return {
      ok: false,
      msg: `${fieldLabel} precisa ser numerico.`,
    };
  }

  return {
    ok: true,
    value: number,
  };
};

const parseOptionalNumber = (value, fieldLabel, defaultValue = 0) => {
  if (value === undefined || value === null || value === "") {
    return {
      ok: true,
      value: defaultValue,
    };
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return {
      ok: false,
      msg: `${fieldLabel} precisa ser numerico.`,
    };
  }

  return {
    ok: true,
    value: number,
  };
};

const parsePositiveNumber = (value, fieldLabel) => {
  const result = parseRequiredNumber(value, fieldLabel);

  if (!result.ok) {
    return result;
  }

  if (result.value <= 0) {
    return {
      ok: false,
      msg: `${fieldLabel} precisa ser maior que zero.`,
    };
  }

  return result;
};

const parseRequiredInteger = (value, fieldLabel) => {
  const result = parseRequiredNumber(value, fieldLabel);

  if (!result.ok) {
    return result;
  }

  if (!Number.isInteger(result.value)) {
    return {
      ok: false,
      msg: `${fieldLabel} precisa ser inteiro.`,
    };
  }

  return result;
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

const validateCalculatedFieldsAreNotManual = (body = {}) => {
  const calculatedFields = [
    "valorTotalBm",
    "totalFaturado",
    "pendenteFaturamento",
    "totalPago",
    "pendentePagamento",
    "statusFaturamento",
    "statusPagamento",
  ];

  const field = calculatedFields.find((fieldName) =>
    Object.prototype.hasOwnProperty.call(body, fieldName),
  );

  if (!field) {
    return {
      ok: true,
    };
  }

  return {
    ok: false,
    status: 422,
    msg: `${field} e calculado pelo backend e nao deve ser informado.`,
  };
};

const getBoletimPayload = (body = {}, options = {}) => {
  const calculatedFieldsResult = validateCalculatedFieldsAreNotManual(body);
  if (!calculatedFieldsResult.ok) return calculatedFieldsResult;

  const payload = {};

  if (options.requireContratoId) {
    const contratoId = getIdText(body.contratoId);

    if (!contratoId) {
      return {
        ok: false,
        status: 422,
        msg: "O contrato e obrigatorio.",
      };
    }

    if (!mongoose.Types.ObjectId.isValid(contratoId)) {
      return {
        ok: false,
        status: 422,
        msg: "Contrato invalido.",
      };
    }

    payload.contratoId = contratoId;
  }

  const numeroBmResult = getRequiredString(body, "numeroBm", "O numero do BM");
  if (!numeroBmResult.ok) return numeroBmResult;

  const mesResult = parseRequiredInteger(body.mes, "O mes");
  if (!mesResult.ok) return mesResult;

  if (mesResult.value < 1 || mesResult.value > 12) {
    return {
      ok: false,
      status: 422,
      msg: "O mes precisa estar entre 1 e 12.",
    };
  }

  const anoResult = parseRequiredInteger(body.ano, "O ano");
  if (!anoResult.ok) return anoResult;

  const valorBmResult = parseRequiredNumber(body.valorBm, "O valor do BM");
  if (!valorBmResult.ok) return valorBmResult;

  const reajusteResult = parseOptionalNumber(body.reajuste, "O reajuste", 0);
  if (!reajusteResult.ok) return reajusteResult;

  const dataRegistroResult = parseRequiredDate(
    body.dataRegistro,
    "Data de registro",
  );
  if (!dataRegistroResult.ok) return dataRegistroResult;

  const observacoesResult = getOptionalString(
    body,
    "observacoes",
    "As observacoes",
  );
  if (!observacoesResult.ok) return observacoesResult;

  return {
    ok: true,
    payload: {
      ...payload,
      numeroBm: numeroBmResult.value,
      mes: mesResult.value,
      ano: anoResult.value,
      valorBm: valorBmResult.value,
      reajuste: reajusteResult.value,
      dataRegistro: dataRegistroResult.value,
      observacoes: observacoesResult.value,
    },
  };
};

const canAccessContrato = (profile, contrato) =>
  profile.canManageAll || sameObjectId(contrato?.gestorId, profile.user._id);

const canAccessBoletim = (profile, boletim) =>
  canAccessContrato(profile, boletim?.contratoId);

const getContratoByIdForBoletim = async (contratoId, profile) => {
  if (!mongoose.Types.ObjectId.isValid(contratoId)) {
    return {
      ok: false,
      status: 422,
      msg: "Contrato invalido.",
    };
  }

  const contrato = await Contrato.findById(contratoId)
    .select("_id codigo nomeContrato cliente estado gestorId status")
    .populate({ path: "gestorId", select: "_id name email" });

  if (!contrato) {
    return {
      ok: false,
      status: 404,
      msg: "Contrato nao encontrado.",
    };
  }

  if (!canAccessContrato(profile, contrato)) {
    return {
      ok: false,
      status: 403,
      msg: "Acesso negado.",
    };
  }

  if (contrato.status !== CONTRATO_STATUS_ACTIVE) {
    return {
      ok: false,
      status: 409,
      msg: "Boletim so pode ser criado para contrato ativo.",
    };
  }

  return {
    ok: true,
    contrato,
  };
};

const findBoletimById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return {
      ok: false,
      status: 422,
      msg: "Boletim invalido.",
    };
  }

  const boletim = await Boletim.findById(id).populate(boletimPopulateConfig);

  if (!boletim) {
    return {
      ok: false,
      status: 404,
      msg: "Boletim nao encontrado.",
    };
  }

  return {
    ok: true,
    boletim,
  };
};

const ensureBoletimNotDeleted = (boletim) => {
  if (!boletim.deletedAt) {
    return {
      ok: true,
    };
  }

  return {
    ok: false,
    status: 409,
    msg: "Boletim excluido nao pode ser alterado.",
  };
};

const findDuplicatedBoletim = async ({
  contratoId,
  numeroBm,
  mes,
  ano,
  boletimId,
}) => {
  const filter = {
    contratoId,
    numeroBm,
    mes,
    ano,
    ...notDeletedFilter,
  };

  if (boletimId) {
    filter._id = { $ne: boletimId };
  }

  return Boletim.findOne(filter);
};

const getTotalsForBoletimIds = async (boletimIds = []) => {
  if (!boletimIds.length) {
    return {
      faturamentos: new Map(),
      pagamentos: new Map(),
    };
  }

  const ids = boletimIds.map(toObjectId);

  const [faturamentos, pagamentos] = await Promise.all([
    Faturamento.aggregate([
      { $match: { boletimId: { $in: ids } } },
      { $group: { _id: "$boletimId", total: { $sum: "$valorFaturado" } } },
    ]),
    Pagamento.aggregate([
      { $match: { boletimId: { $in: ids } } },
      { $group: { _id: "$boletimId", total: { $sum: "$valorPago" } } },
    ]),
  ]);

  return {
    faturamentos: new Map(
      faturamentos.map((item) => [String(item._id), item.total || 0]),
    ),
    pagamentos: new Map(
      pagamentos.map((item) => [String(item._id), item.total || 0]),
    ),
  };
};

const getTotalsForBoletim = async (boletimId) => {
  const totals = await getTotalsForBoletimIds([boletimId]);

  return {
    totalFaturado: totals.faturamentos.get(getIdText(boletimId)) || 0,
    totalPago: totals.pagamentos.get(getIdText(boletimId)) || 0,
  };
};

const getFinancialSummary = (boletim, totals = {}) => {
  const valorTotalBmCents =
    toCents(boletim.valorBm) + toCents(boletim.reajuste);
  const totalFaturadoCents = toCents(totals.totalFaturado);
  const totalPagoCents = toCents(totals.totalPago);
  const pendenteFaturamentoCents = valorTotalBmCents - totalFaturadoCents;
  const pendentePagamentoCents = totalFaturadoCents - totalPagoCents;

  let statusFaturamento = STATUS_FATURAMENTO_FATURADO;

  if (totalFaturadoCents === 0) {
    statusFaturamento = STATUS_FATURAMENTO_NAO_FATURADO;
  } else if (totalFaturadoCents < valorTotalBmCents) {
    statusFaturamento = STATUS_FATURAMENTO_PARCIAL;
  }

  let statusPagamento = STATUS_PAGAMENTO_PAGO;

  if (totalFaturadoCents === 0) {
    statusPagamento = STATUS_PAGAMENTO_NAO_FATURADO;
  } else if (totalPagoCents === 0) {
    statusPagamento = STATUS_PAGAMENTO_NAO_PAGO;
  } else if (totalPagoCents < totalFaturadoCents) {
    statusPagamento = STATUS_PAGAMENTO_PARCIAL;
  }

  return {
    valorTotalBm: fromCents(valorTotalBmCents),
    totalFaturado: fromCents(totalFaturadoCents),
    pendenteFaturamento: fromCents(pendenteFaturamentoCents),
    totalPago: fromCents(totalPagoCents),
    pendentePagamento: fromCents(pendentePagamentoCents),
    statusFaturamento,
    statusPagamento,
  };
};

const mapBoletimResponse = (boletim, totals = {}) => ({
  _id: boletim._id,
  contratoId: mapContratoResponse(boletim.contratoId),
  numeroBm: boletim.numeroBm,
  mes: boletim.mes,
  ano: boletim.ano,
  valorBm: boletim.valorBm,
  reajuste: boletim.reajuste || 0,
  dataRegistro: boletim.dataRegistro,
  observacoes: boletim.observacoes || "",
  ...getFinancialSummary(boletim, totals),
  createdBy: mapUser(boletim.createdBy),
  createdAt: boletim.createdAt,
  updatedBy: mapUser(boletim.updatedBy),
  updatedAt: boletim.updatedAt,
  deletedBy: mapUser(boletim.deletedBy),
  deletedAt: boletim.deletedAt,
});

const getDeletedListFilter = (query = {}) => {
  const deletedText = getText(
    query.deleted ?? query.excluido ?? query.excluidos,
  );

  if (deletedText === null) {
    return {
      ok: false,
      status: 422,
      msg: "Filtro de exclusao invalido.",
    };
  }

  if (!deletedText) {
    return {
      ok: true,
      filter: notDeletedFilter,
    };
  }

  const normalizedDeleted = normalizeText(deletedText);

  if (
    ["true", "sim", "excluido", "excluidos", "deleted"].includes(
      normalizedDeleted,
    )
  ) {
    return {
      ok: true,
      filter: deletedFilter,
    };
  }

  if (
    ["false", "nao", "ativos", "nao excluidos", "not deleted"].includes(
      normalizedDeleted,
    )
  ) {
    return {
      ok: true,
      filter: notDeletedFilter,
    };
  }

  if (["todos", "all"].includes(normalizedDeleted)) {
    return {
      ok: true,
      filter: {},
    };
  }

  return {
    ok: false,
    status: 422,
    msg: "Filtro de exclusao invalido.",
  };
};

const getContratoFilterForList = (query = {}, profile) => {
  const filter = {};
  const contratoId = getIdText(query.contratoId || query.contrato);

  if (contratoId) {
    if (!mongoose.Types.ObjectId.isValid(contratoId)) {
      return {
        ok: false,
        status: 422,
        msg: "Filtro de contrato invalido.",
      };
    }

    filter._id = contratoId;
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

const getBoletimFilterForList = (query = {}, contratoIds = []) => {
  const deletedResult = getDeletedListFilter(query);
  if (!deletedResult.ok) return deletedResult;

  const filter = {
    ...deletedResult.filter,
    contratoId: { $in: contratoIds },
  };

  const numeroBm = getText(query.q || query.search || query.numeroBm);
  if (numeroBm === null) {
    return {
      ok: false,
      status: 422,
      msg: "Busca por numero do BM invalida.",
    };
  }

  if (numeroBm) {
    filter.numeroBm = new RegExp(escapeRegex(numeroBm), "i");
  }

  if (query.mes !== undefined && query.mes !== null && query.mes !== "") {
    const mesResult = parseRequiredInteger(query.mes, "O mes");
    if (!mesResult.ok) return mesResult;

    if (mesResult.value < 1 || mesResult.value > 12) {
      return {
        ok: false,
        status: 422,
        msg: "O mes precisa estar entre 1 e 12.",
      };
    }

    filter.mes = mesResult.value;
  }

  if (query.ano !== undefined && query.ano !== null && query.ano !== "") {
    const anoResult = parseRequiredInteger(query.ano, "O ano");
    if (!anoResult.ok) return anoResult;

    filter.ano = anoResult.value;
  }

  return {
    ok: true,
    filter,
  };
};

const getValorTotalSort = (query = {}) => {
  const sortBy = normalizeText(query.sortBy || query.orderBy || query.ordenarPor);

  if (!sortBy || sortBy !== "valortotalbm") {
    return null;
  }

  const order = normalizeText(query.order || query.sortOrder || query.ordem);

  if (["asc", "crescente", "menor", "menor para maior"].includes(order)) {
    return 1;
  }

  return -1;
};

const applyCalculatedFilters = (boletins = [], query = {}) => {
  const statusFaturamentoText = getText(query.statusFaturamento);

  if (statusFaturamentoText === null) {
    return {
      ok: false,
      status: 422,
      msg: "Filtro de status de faturamento invalido.",
    };
  }

  const statusPagamentoText = getText(query.statusPagamento);

  if (statusPagamentoText === null) {
    return {
      ok: false,
      status: 422,
      msg: "Filtro de status de pagamento invalido.",
    };
  }

  let filteredBoletins = boletins;

  if (statusFaturamentoText) {
    const statusFaturamento = normalizeCalculatedStatus(
      statusFaturamentoText,
      FATURAMENTO_STATUSES,
    );

    if (!statusFaturamento) {
      return {
        ok: false,
        status: 422,
        msg: "Status de faturamento invalido.",
      };
    }

    filteredBoletins = filteredBoletins.filter(
      (boletim) => boletim.statusFaturamento === statusFaturamento,
    );
  }

  if (statusPagamentoText) {
    const statusPagamento = normalizeCalculatedStatus(
      statusPagamentoText,
      PAGAMENTO_STATUSES,
    );

    if (!statusPagamento) {
      return {
        ok: false,
        status: 422,
        msg: "Status de pagamento invalido.",
      };
    }

    filteredBoletins = filteredBoletins.filter(
      (boletim) => boletim.statusPagamento === statusPagamento,
    );
  }

  return {
    ok: true,
    boletins: filteredBoletins,
  };
};

const handleMongoDuplicateError = (error, res) => {
  if (error?.code !== 11000) {
    return false;
  }

  res.status(422).json({
    msg: "Ja existe boletim nao excluido para contrato, numero, mes e ano informados.",
  });

  return true;
};

const listBoletins = async (req, res) => {
  try {
    const profile = await getCurrentUserProfile(req);
    if (!profile.ok) {
      return res.status(profile.status).json({ msg: profile.msg });
    }

    const contratoFilterResult = getContratoFilterForList(req.query, profile);
    if (!contratoFilterResult.ok) {
      return res
        .status(contratoFilterResult.status)
        .json({ msg: contratoFilterResult.msg });
    }

    const contratos = await Contrato.find(
      contratoFilterResult.filter,
      "_id",
    ).lean();
    const contratoIds = contratos.map((contrato) => contrato._id);

    if (!contratoIds.length) {
      return res.status(200).json([]);
    }

    const boletimFilterResult = getBoletimFilterForList(req.query, contratoIds);
    if (!boletimFilterResult.ok) {
      return res
        .status(boletimFilterResult.status || 422)
        .json({ msg: boletimFilterResult.msg });
    }

    const boletins = await Boletim.find(boletimFilterResult.filter)
      .populate(boletimPopulateConfig)
      .sort({ updatedAt: -1 });

    const totals = await getTotalsForBoletimIds(
      boletins.map((boletim) => boletim._id),
    );

    const mappedBoletins = boletins.map((boletim) =>
      mapBoletimResponse(boletim, {
        totalFaturado: totals.faturamentos.get(String(boletim._id)) || 0,
        totalPago: totals.pagamentos.get(String(boletim._id)) || 0,
      }),
    );

    const calculatedFilterResult = applyCalculatedFilters(
      mappedBoletins,
      req.query,
    );

    if (!calculatedFilterResult.ok) {
      return res
        .status(calculatedFilterResult.status)
        .json({ msg: calculatedFilterResult.msg });
    }

    const valorTotalSort = getValorTotalSort(req.query);
    if (valorTotalSort) {
      calculatedFilterResult.boletins.sort(
        (left, right) =>
          (left.valorTotalBm - right.valorTotalBm) * valorTotalSort,
      );
    }

    return res.status(200).json(calculatedFilterResult.boletins);
  } catch (error) {
    console.log("listBoletins error", error);
    return res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

const listBoletimById = async (req, res) => {
  try {
    const profile = await getCurrentUserProfile(req);
    if (!profile.ok) {
      return res.status(profile.status).json({ msg: profile.msg });
    }

    const result = await findBoletimById(req.params.id);
    if (!result.ok) {
      return res.status(result.status).json({ msg: result.msg });
    }

    if (!canAccessBoletim(profile, result.boletim)) {
      return res.status(403).json({ msg: "Acesso negado." });
    }

    const totals = await getTotalsForBoletim(result.boletim._id);

    return res
      .status(200)
      .json(mapBoletimResponse(result.boletim, totals));
  } catch (error) {
    console.log("listBoletimById error", error);
    return res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

const createBoletim = async (req, res) => {
  try {
    const profile = await getCurrentUserProfile(req);
    if (!profile.ok) {
      return res.status(profile.status).json({ msg: profile.msg });
    }

    const payloadResult = getBoletimPayload(req.body, {
      requireContratoId: true,
    });

    if (!payloadResult.ok) {
      return res
        .status(payloadResult.status || 422)
        .json({ msg: payloadResult.msg });
    }

    const contratoResult = await getContratoByIdForBoletim(
      payloadResult.payload.contratoId,
      profile,
    );

    if (!contratoResult.ok) {
      return res.status(contratoResult.status).json({ msg: contratoResult.msg });
    }

    const duplicatedBoletim = await findDuplicatedBoletim(payloadResult.payload);
    if (duplicatedBoletim) {
      return res.status(422).json({
        msg: "Ja existe boletim nao excluido para contrato, numero, mes e ano informados.",
      });
    }

    const boletim = new Boletim({
      ...payloadResult.payload,
      createdBy: profile.user._id,
      updatedBy: profile.user._id,
    });

    await boletim.save();
    await boletim.populate(boletimPopulateConfig);

    return res.status(201).json({
      msg: "Boletim criado com sucesso.",
      boletim: mapBoletimResponse(boletim, {
        totalFaturado: 0,
        totalPago: 0,
      }),
    });
  } catch (error) {
    console.log("createBoletim error", error);

    if (handleMongoDuplicateError(error, res)) {
      return;
    }

    return res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

const editBoletim = async (req, res) => {
  try {
    const profile = await getCurrentUserProfile(req);
    if (!profile.ok) {
      return res.status(profile.status).json({ msg: profile.msg });
    }

    const findResult = await findBoletimById(req.params.id);
    if (!findResult.ok) {
      return res.status(findResult.status).json({ msg: findResult.msg });
    }

    const boletim = findResult.boletim;

    if (!canAccessBoletim(profile, boletim)) {
      return res.status(403).json({ msg: "Acesso negado." });
    }

    const notDeletedResult = ensureBoletimNotDeleted(boletim);
    if (!notDeletedResult.ok) {
      return res
        .status(notDeletedResult.status)
        .json({ msg: notDeletedResult.msg });
    }

    const nextContratoId = getIdText(req.body?.contratoId);
    if (nextContratoId && !sameObjectId(nextContratoId, boletim.contratoId)) {
      return res.status(422).json({
        msg: "Contrato do boletim nao pode ser alterado.",
      });
    }

    const payloadResult = getBoletimPayload(req.body, {
      requireContratoId: false,
    });

    if (!payloadResult.ok) {
      return res
        .status(payloadResult.status || 422)
        .json({ msg: payloadResult.msg });
    }

    const duplicatedBoletim = await findDuplicatedBoletim({
      ...payloadResult.payload,
      contratoId: boletim.contratoId,
      boletimId: boletim._id,
    });

    if (duplicatedBoletim) {
      return res.status(422).json({
        msg: "Ja existe boletim nao excluido para contrato, numero, mes e ano informados.",
      });
    }

    const totals = await getTotalsForBoletim(boletim._id);
    const currentFinancial = getFinancialSummary(boletim, totals);
    const currentValorTotalCents = toCents(currentFinancial.valorTotalBm);
    const totalFaturadoCents = toCents(totals.totalFaturado);
    const nextValorTotalCents =
      toCents(payloadResult.payload.valorBm) + toCents(payloadResult.payload.reajuste);
    const changingBmValue =
      toCents(payloadResult.payload.valorBm) !== toCents(boletim.valorBm) ||
      toCents(payloadResult.payload.reajuste) !== toCents(boletim.reajuste);

    if (totalFaturadoCents === currentValorTotalCents && changingBmValue) {
      return res.status(409).json({
        msg: "Boletim totalmente faturado nao permite alterar valor do BM ou reajuste.",
      });
    }

    if (nextValorTotalCents < totalFaturadoCents) {
      return res.status(409).json({
        msg: "Valor total do BM nao pode ficar menor que o total ja faturado.",
      });
    }

    boletim.numeroBm = payloadResult.payload.numeroBm;
    boletim.mes = payloadResult.payload.mes;
    boletim.ano = payloadResult.payload.ano;
    boletim.valorBm = payloadResult.payload.valorBm;
    boletim.reajuste = payloadResult.payload.reajuste;
    boletim.dataRegistro = payloadResult.payload.dataRegistro;
    boletim.observacoes = payloadResult.payload.observacoes;
    boletim.updatedBy = profile.user._id;

    await boletim.save();
    await boletim.populate(boletimPopulateConfig);

    return res.status(200).json({
      msg: "Boletim atualizado com sucesso.",
      boletim: mapBoletimResponse(boletim, totals),
    });
  } catch (error) {
    console.log("editBoletim error", error);

    if (handleMongoDuplicateError(error, res)) {
      return;
    }

    return res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

const deleteBoletim = async (req, res) => {
  try {
    const profile = await getCurrentUserProfile(req);
    if (!profile.ok) {
      return res.status(profile.status).json({ msg: profile.msg });
    }

    const findResult = await findBoletimById(req.params.id);
    if (!findResult.ok) {
      return res.status(findResult.status).json({ msg: findResult.msg });
    }

    const boletim = findResult.boletim;

    if (!canAccessBoletim(profile, boletim)) {
      return res.status(403).json({ msg: "Acesso negado." });
    }

    const notDeletedResult = ensureBoletimNotDeleted(boletim);
    if (!notDeletedResult.ok) {
      return res
        .status(notDeletedResult.status)
        .json({ msg: notDeletedResult.msg });
    }

    boletim.deletedBy = profile.user._id;
    boletim.deletedAt = new Date();
    boletim.updatedBy = profile.user._id;

    await boletim.save();
    await boletim.populate(boletimPopulateConfig);

    const totals = await getTotalsForBoletim(boletim._id);

    return res.status(200).json({
      msg: "Boletim excluido logicamente com sucesso.",
      boletim: mapBoletimResponse(boletim, totals),
    });
  } catch (error) {
    console.log("deleteBoletim error", error);
    return res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

const getBoletimForLancamento = async (boletimId, profile, options = {}) => {
  const result = await findBoletimById(boletimId);

  if (!result.ok) {
    return result;
  }

  if (!canAccessBoletim(profile, result.boletim)) {
    return {
      ok: false,
      status: 403,
      msg: "Acesso negado.",
    };
  }

  if (options.requireNotDeleted) {
    const notDeletedResult = ensureBoletimNotDeleted(result.boletim);

    if (!notDeletedResult.ok) {
      return notDeletedResult;
    }
  }

  return result;
};

const {
  createFaturamento,
  listFaturamentosByBoletim,
  deleteFaturamento,
  createPagamento,
  listPagamentosByBoletim,
  deletePagamento,
} = createBoletinsLancamentosController({
  mongoose,
  Faturamento,
  Pagamento,
  getCurrentUserProfile,
  getBoletimForLancamento,
  parsePositiveNumber,
  parseRequiredDate,
  getTotalsForBoletim,
  getFinancialSummary,
  toCents,
  mapBoletimResponse,
});

module.exports = {
  listBoletins,
  listBoletimById,
  createBoletim,
  editBoletim,
  deleteBoletim,
  createFaturamento,
  listFaturamentosByBoletim,
  deleteFaturamento,
  createPagamento,
  listPagamentosByBoletim,
  deletePagamento,
};
