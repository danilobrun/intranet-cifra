const mongoose = require("mongoose");
const CentroCustoMovimentacao = require("../../models/CentroCustoMovimentacao");
const Funcionario = require("../../models/Funcionario");
const { normalizeCpf } = require("../helpers/cpf");

const MOVIMENTACAO_STATUSES = ["Pendente", "Aplicado na Folha"];
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

class CentroCustoMovimentacaoServiceError extends Error {
  constructor(statusCode, msg, details = {}) {
    super(msg);
    this.statusCode = statusCode;
    this.msg = msg;
    this.details = details;
  }
}

const normalizeText = (value) => {
  if (value === null || value === undefined) return "";

  return String(value).trim();
};

const normalizeComparableText = (value) =>
  normalizeText(value).toLocaleLowerCase("pt-BR");

const escapeRegex = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const ensureAuthenticatedUser = (user) => {
  if (!user?.id) {
    throw new CentroCustoMovimentacaoServiceError(
      401,
      "Usuário autenticado não identificado.",
    );
  }
};

const validateObjectId = (id, message) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new CentroCustoMovimentacaoServiceError(422, message);
  }
};

const parsePositiveInteger = (value, fallback, fieldName) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    throw new CentroCustoMovimentacaoServiceError(
      422,
      `${fieldName} deve ser um número inteiro positivo.`,
    );
  }

  return parsedValue;
};

const getPagination = (query = {}) => {
  const page = parsePositiveInteger(query.page, DEFAULT_PAGE, "page");
  const requestedLimit = parsePositiveInteger(
    query.limit,
    DEFAULT_LIMIT,
    "limit",
  );

  return {
    page,
    limit: Math.min(requestedLimit, MAX_LIMIT),
  };
};

const normalizeStatus = (value) => {
  const normalizedValue = normalizeText(value).toLocaleLowerCase("pt-BR");

  return MOVIMENTACAO_STATUSES.find(
    (status) => status.toLocaleLowerCase("pt-BR") === normalizedValue,
  );
};

const parseDate = (value, fieldName) => {
  if (!normalizeText(value)) {
    throw new CentroCustoMovimentacaoServiceError(
      422,
      `${fieldName} é obrigatório.`,
    );
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new CentroCustoMovimentacaoServiceError(
      422,
      `${fieldName} inválida.`,
    );
  }

  return date;
};

const getDateRangeFilter = (query = {}) => {
  const dataInicio = normalizeText(query.dataInicio);
  const dataFim = normalizeText(query.dataFim);
  const filter = {};

  if (dataInicio) {
    const startDate = new Date(dataInicio);

    if (Number.isNaN(startDate.getTime())) {
      throw new CentroCustoMovimentacaoServiceError(
        422,
        "Data inicial inválida.",
      );
    }

    startDate.setHours(0, 0, 0, 0);
    filter.$gte = startDate;
  }

  if (dataFim) {
    const endDate = new Date(dataFim);

    if (Number.isNaN(endDate.getTime())) {
      throw new CentroCustoMovimentacaoServiceError(
        422,
        "Data final inválida.",
      );
    }

    endDate.setHours(23, 59, 59, 999);
    filter.$lte = endDate;
  }

  return Object.keys(filter).length ? filter : undefined;
};

const mapUser = (user) => {
  if (!user) return null;

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
  };
};

const mapMovimentacao = (movimentacao) => ({
  _id: movimentacao._id,
  funcionarioId: movimentacao.funcionarioId,
  nome: movimentacao.nome,
  cpf: movimentacao.cpf,
  centroCustoAnterior: movimentacao.centroCustoAnterior,
  novoCentroCusto: movimentacao.novoCentroCusto,
  dataAlteracao: movimentacao.dataAlteracao,
  observacao: movimentacao.observacao,
  status: movimentacao.status,
  createdBy: mapUser(movimentacao.createdBy),
  updatedBy: mapUser(movimentacao.updatedBy),
  appliedBy: mapUser(movimentacao.appliedBy),
  appliedAt: movimentacao.appliedAt,
  createdAt: movimentacao.createdAt,
  updatedAt: movimentacao.updatedAt,
});

const mapMinhaMovimentacao = (movimentacao) => ({
  id: movimentacao._id,
  nome: movimentacao.nome,
  cpf: movimentacao.cpf,
  centroCustoAnterior: movimentacao.centroCustoAnterior,
  novoCentroCusto: movimentacao.novoCentroCusto,
  dataAlteracao: movimentacao.dataAlteracao,
  observacao: movimentacao.observacao,
  createdBy: mapUser(movimentacao.createdBy),
  createdAt: movimentacao.createdAt,
  updatedAt: movimentacao.updatedAt,
});

const movimentacaoPopulateConfig = [
  { path: "createdBy", select: "_id name email" },
  { path: "updatedBy", select: "_id name email" },
  { path: "appliedBy", select: "_id name email" },
];

const minhaMovimentacaoPopulateConfig = [
  { path: "createdBy", select: "_id name email" },
];

const buildMovimentacaoFilters = (query = {}, options = {}) => {
  const includeStatus = options.includeStatus !== false;
  const filters = {};
  const search = normalizeText(query.search || query.q);
  const cpf = normalizeCpf(query.cpf);
  const centroCustoAnterior = normalizeText(query.centroCustoAnterior);
  const novoCentroCusto = normalizeText(query.novoCentroCusto);
  const statusText = normalizeText(query.status);
  const dataAlteracaoFilter = getDateRangeFilter(query);

  if (includeStatus && statusText) {
    const status = normalizeStatus(statusText);

    if (!status) {
      throw new CentroCustoMovimentacaoServiceError(
        422,
        "Status de movimentação inválido.",
      );
    }

    filters.status = status;
  }

  if (cpf) {
    filters.cpf = new RegExp(escapeRegex(cpf), "i");
  }

  if (centroCustoAnterior) {
    filters.centroCustoAnterior = new RegExp(
      escapeRegex(centroCustoAnterior),
      "i",
    );
  }

  if (novoCentroCusto) {
    filters.novoCentroCusto = new RegExp(escapeRegex(novoCentroCusto), "i");
  }

  if (dataAlteracaoFilter) {
    filters.dataAlteracao = dataAlteracaoFilter;
  }

  if (search) {
    const normalizedSearchCpf = normalizeCpf(search);
    const searchRegex = new RegExp(escapeRegex(search), "i");
    const searchFilters = [{ nome: searchRegex }];

    if (normalizedSearchCpf) {
      searchFilters.push({
        cpf: new RegExp(escapeRegex(normalizedSearchCpf), "i"),
      });
    }

    filters.$or = searchFilters;
  }

  return filters;
};

const listCentroCustoMovimentacoes = async (query = {}) => {
  const filters = buildMovimentacaoFilters(query);
  const { page, limit } = getPagination(query);
  const skip = (page - 1) * limit;

  const [movimentacoes, total] = await Promise.all([
    CentroCustoMovimentacao.find(filters)
      .populate(movimentacaoPopulateConfig)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    CentroCustoMovimentacao.countDocuments(filters),
  ]);

  return {
    movimentacoes: movimentacoes.map(mapMovimentacao),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const listMinhasCentroCustoMovimentacoes = async (query = {}, user) => {
  ensureAuthenticatedUser(user);

  const filters = {
    ...buildMovimentacaoFilters(query, { includeStatus: false }),
    createdBy: user.id,
  };
  const { page, limit } = getPagination(query);
  const skip = (page - 1) * limit;

  const [movimentacoes, total] = await Promise.all([
    CentroCustoMovimentacao.find(filters)
      .select(
        "_id nome cpf centroCustoAnterior novoCentroCusto dataAlteracao observacao createdBy createdAt updatedAt",
      )
      .populate(minhaMovimentacaoPopulateConfig)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    CentroCustoMovimentacao.countDocuments(filters),
  ]);

  return {
    movimentacoes: movimentacoes.map(mapMinhaMovimentacao),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getCentroCustoMovimentacaoById = async (id) => {
  validateObjectId(id, "Movimentação inválida.");

  const movimentacao = await CentroCustoMovimentacao.findById(id).populate(
    movimentacaoPopulateConfig,
  );

  if (!movimentacao) {
    throw new CentroCustoMovimentacaoServiceError(
      404,
      "Movimentação não encontrada.",
    );
  }

  return mapMovimentacao(movimentacao);
};

const createCentroCustoMovimentacao = async (payload = {}, user) => {
  ensureAuthenticatedUser(user);

  const funcionarioId = normalizeText(payload.funcionarioId);
  const novoCentroCusto = normalizeText(payload.novoCentroCusto);
  const observacao = normalizeText(payload.observacao);

  if (!funcionarioId) {
    throw new CentroCustoMovimentacaoServiceError(
      422,
      "funcionarioId é obrigatório.",
    );
  }

  validateObjectId(funcionarioId, "Funcionário inválido.");

  if (!novoCentroCusto) {
    throw new CentroCustoMovimentacaoServiceError(
      422,
      "O novo centro de custo é obrigatório.",
    );
  }

  const dataAlteracao = parseDate(payload.dataAlteracao, "Data de alteração");
  const funcionario = await Funcionario.findById(funcionarioId);

  if (!funcionario) {
    throw new CentroCustoMovimentacaoServiceError(
      404,
      "Funcionário não encontrado.",
    );
  }

  if (funcionario.status === "Inativo") {
    throw new CentroCustoMovimentacaoServiceError(
      422,
      "Não é possível criar movimentação para funcionário inativo.",
    );
  }

  if (
    normalizeComparableText(funcionario.centroCusto) ===
    normalizeComparableText(novoCentroCusto)
  ) {
    throw new CentroCustoMovimentacaoServiceError(
      422,
      "O novo centro de custo deve ser diferente do centro de custo atual.",
    );
  }

  const movimentacao = await CentroCustoMovimentacao.create({
    funcionarioId: funcionario._id,
    nome: funcionario.nome,
    cpf: funcionario.cpf,
    centroCustoAnterior: funcionario.centroCusto,
    novoCentroCusto,
    dataAlteracao,
    observacao,
    status: "Pendente",
    createdBy: user.id,
  });

  const createdMovimentacao = await CentroCustoMovimentacao.findById(
    movimentacao._id,
  ).populate(movimentacaoPopulateConfig);

  return mapMovimentacao(createdMovimentacao);
};

const applyCentroCustoMovimentacaoNaFolha = async (id, user) => {
  ensureAuthenticatedUser(user);
  validateObjectId(id, "Movimentação inválida.");

  const movimentacao = await CentroCustoMovimentacao.findById(id);

  if (!movimentacao) {
    throw new CentroCustoMovimentacaoServiceError(
      404,
      "Movimentação não encontrada.",
    );
  }

  if (movimentacao.status === "Aplicado na Folha") {
    throw new CentroCustoMovimentacaoServiceError(
      409,
      "Movimentação já aplicada na folha.",
    );
  }

  if (movimentacao.status !== "Pendente") {
    throw new CentroCustoMovimentacaoServiceError(
      422,
      "Somente movimentações pendentes podem ser aplicadas na folha.",
    );
  }

  const funcionario = await Funcionario.findById(movimentacao.funcionarioId);

  if (!funcionario) {
    throw new CentroCustoMovimentacaoServiceError(
      404,
      "Funcionário vinculado à movimentação não encontrado.",
    );
  }

  if (
    normalizeComparableText(funcionario.centroCusto) !==
    normalizeComparableText(movimentacao.centroCustoAnterior)
  ) {
    throw new CentroCustoMovimentacaoServiceError(
      409,
      "O centro de custo atual do funcionário é diferente do centro de custo anterior registrado na movimentação. Revise antes de aplicar na folha.",
      {
        centroCustoAtual: funcionario.centroCusto,
        centroCustoAnteriorMovimentacao: movimentacao.centroCustoAnterior,
      },
    );
  }

  const appliedAt = new Date();

  funcionario.centroCusto = movimentacao.novoCentroCusto;
  funcionario.updatedBy = user.id;
  await funcionario.save();

  movimentacao.status = "Aplicado na Folha";
  movimentacao.appliedBy = user.id;
  movimentacao.appliedAt = appliedAt;
  movimentacao.updatedBy = user.id;
  await movimentacao.save();

  const appliedMovimentacao = await CentroCustoMovimentacao.findById(
    movimentacao._id,
  ).populate(movimentacaoPopulateConfig);

  return mapMovimentacao(appliedMovimentacao);
};

module.exports = {
  CentroCustoMovimentacaoServiceError,
  applyCentroCustoMovimentacaoNaFolha,
  createCentroCustoMovimentacao,
  getCentroCustoMovimentacaoById,
  listCentroCustoMovimentacoes,
  listMinhasCentroCustoMovimentacoes,
};
