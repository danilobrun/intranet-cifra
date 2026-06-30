const mongoose = require("mongoose");
const Funcionario = require("../../models/Funcionario");
const { normalizeCpf, validateCpf } = require("../helpers/cpf");

const FUNCIONARIO_STATUSES = ["Ativo", "Inativo"];
const FUNCIONARIO_ORIGENS = ["Manual", "Importacao CSV"];
const EDITABLE_FIELDS = ["nome", "cpf", "centroCusto"];
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

class FuncionarioServiceError extends Error {
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

const escapeRegex = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const ensureAuthenticatedUser = (user) => {
  if (!user?.id) {
    throw new FuncionarioServiceError(
      401,
      "Usuario autenticado nao identificado.",
    );
  }
};

const validateCpfOrThrow = (cpf) => {
  const result = validateCpf(cpf);

  if (!result.ok) {
    throw new FuncionarioServiceError(422, result.msg);
  }

  return result.cpf;
};

const normalizeStatus = (value) => {
  const normalizedValue = normalizeText(value).toLowerCase();

  return FUNCIONARIO_STATUSES.find(
    (status) => status.toLowerCase() === normalizedValue,
  );
};

const normalizeOrigem = (value) => {
  const normalizedValue = normalizeText(value).toLowerCase();

  return FUNCIONARIO_ORIGENS.find(
    (origem) => origem.toLowerCase() === normalizedValue,
  );
};

const parsePositiveInteger = (value, fallback, fieldName) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    throw new FuncionarioServiceError(
      422,
      `${fieldName} deve ser um numero inteiro positivo.`,
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

const mapUser = (user) => {
  if (!user) return null;

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
  };
};

const mapFuncionario = (funcionario) => ({
  _id: funcionario._id,
  nome: funcionario.nome,
  cpf: funcionario.cpf,
  centroCusto: funcionario.centroCusto,
  status: funcionario.status,
  origem: funcionario.origem,
  createdBy: mapUser(funcionario.createdBy),
  updatedBy: mapUser(funcionario.updatedBy),
  inactivatedBy: mapUser(funcionario.inactivatedBy),
  inactivatedAt: funcionario.inactivatedAt,
  createdAt: funcionario.createdAt,
  updatedAt: funcionario.updatedAt,
});

const funcionarioPopulateConfig = [
  { path: "createdBy", select: "_id name email" },
  { path: "updatedBy", select: "_id name email" },
  { path: "inactivatedBy", select: "_id name email" },
];

const buildFuncionarioFilters = (query = {}) => {
  const filters = {};
  const search = normalizeText(query.search || query.q);
  const centroCusto = normalizeText(query.centroCusto);
  const statusText = normalizeText(query.status);

  if (statusText) {
    const status = normalizeStatus(statusText);

    if (!status) {
      throw new FuncionarioServiceError(422, "Status de funcionario invalido.");
    }

    filters.status = status;
  }

  if (centroCusto) {
    filters.centroCusto = new RegExp(escapeRegex(centroCusto), "i");
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

const ensureCpfIsAvailable = async (cpf, ignoredFuncionarioId = null) => {
  const filters = { cpf };

  if (ignoredFuncionarioId) {
    filters._id = { $ne: ignoredFuncionarioId };
  }

  const existingFuncionario = await Funcionario.findOne(filters);

  if (existingFuncionario) {
    throw new FuncionarioServiceError(409, "Ja existe funcionario com este CPF.", {
      funcionario: {
        _id: existingFuncionario._id,
        nome: existingFuncionario.nome,
        cpf: existingFuncionario.cpf,
        centroCusto: existingFuncionario.centroCusto,
        status: existingFuncionario.status,
      },
    });
  }
};

const getCreatePayload = (payload = {}) => {
  const nome = normalizeText(payload.nome);
  const cpf = validateCpfOrThrow(payload.cpf);
  const centroCusto = normalizeText(payload.centroCusto);

  if (!nome) {
    throw new FuncionarioServiceError(422, "O nome e obrigatorio.");
  }

  if (!centroCusto) {
    throw new FuncionarioServiceError(422, "O centro de custo e obrigatorio.");
  }

  if (payload.status !== undefined && payload.status !== null && payload.status !== "") {
    const status = normalizeStatus(payload.status);

    if (!status) {
      throw new FuncionarioServiceError(422, "Status de funcionario invalido.");
    }
  }

  if (payload.origem !== undefined && payload.origem !== null && payload.origem !== "") {
    const origem = normalizeOrigem(payload.origem);

    if (!origem) {
      throw new FuncionarioServiceError(422, "Origem de funcionario invalida.");
    }
  }

  return {
    nome,
    cpf,
    centroCusto,
  };
};

const getUpdatePayload = (payload = {}) => {
  const requestedFields = Object.keys(payload);
  const invalidFields = requestedFields.filter(
    (field) => !EDITABLE_FIELDS.includes(field),
  );

  if (invalidFields.length) {
    throw new FuncionarioServiceError(
      422,
      "Somente nome, cpf e centroCusto podem ser alterados por esta rota.",
      { invalidFields },
    );
  }

  const editableFieldsInPayload = EDITABLE_FIELDS.filter((field) =>
    Object.prototype.hasOwnProperty.call(payload, field),
  );

  if (!editableFieldsInPayload.length) {
    throw new FuncionarioServiceError(
      422,
      "Informe ao menos um campo para atualizar.",
    );
  }

  const updatePayload = {};

  if (editableFieldsInPayload.includes("nome")) {
    const nome = normalizeText(payload.nome);

    if (!nome) {
      throw new FuncionarioServiceError(422, "O nome e obrigatorio.");
    }

    updatePayload.nome = nome;
  }

  if (editableFieldsInPayload.includes("cpf")) {
    updatePayload.cpf = validateCpfOrThrow(payload.cpf);
  }

  if (editableFieldsInPayload.includes("centroCusto")) {
    const centroCusto = normalizeText(payload.centroCusto);

    if (!centroCusto) {
      throw new FuncionarioServiceError(
        422,
        "O centro de custo e obrigatorio.",
      );
    }

    updatePayload.centroCusto = centroCusto;
  }

  return updatePayload;
};

const handleDuplicateMongoError = (error) => {
  if (error?.code === 11000 && error?.keyPattern?.cpf) {
    throw new FuncionarioServiceError(
      409,
      "Ja existe funcionario com este CPF.",
    );
  }

  throw error;
};

const listFuncionarios = async (query = {}) => {
  const filters = buildFuncionarioFilters(query);
  const { page, limit } = getPagination(query);
  const skip = (page - 1) * limit;

  const [funcionarios, total] = await Promise.all([
    Funcionario.find(filters)
      .populate(funcionarioPopulateConfig)
      .sort({ nome: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Funcionario.countDocuments(filters),
  ]);

  return {
    funcionarios: funcionarios.map(mapFuncionario),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getFuncionarioById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new FuncionarioServiceError(422, "Funcionario invalido.");
  }

  const funcionario = await Funcionario.findById(id).populate(
    funcionarioPopulateConfig,
  );

  if (!funcionario) {
    throw new FuncionarioServiceError(404, "Funcionario nao encontrado.");
  }

  return mapFuncionario(funcionario);
};

const createFuncionario = async (payload = {}, user) => {
  ensureAuthenticatedUser(user);

  const createPayload = getCreatePayload(payload);
  await ensureCpfIsAvailable(createPayload.cpf);

  try {
    const funcionario = await Funcionario.create({
      ...createPayload,
      status: "Ativo",
      origem: "Manual",
      createdBy: user.id,
    });

    const createdFuncionario = await Funcionario.findById(
      funcionario._id,
    ).populate(funcionarioPopulateConfig);

    return mapFuncionario(createdFuncionario);
  } catch (error) {
    handleDuplicateMongoError(error);
  }
};

const updateFuncionario = async (id, payload = {}, user) => {
  ensureAuthenticatedUser(user);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new FuncionarioServiceError(422, "Funcionario invalido.");
  }

  const updatePayload = getUpdatePayload(payload);
  const funcionario = await Funcionario.findById(id);

  if (!funcionario) {
    throw new FuncionarioServiceError(404, "Funcionario nao encontrado.");
  }

  if (updatePayload.cpf) {
    await ensureCpfIsAvailable(updatePayload.cpf, funcionario._id);
  }

  Object.entries(updatePayload).forEach(([field, value]) => {
    funcionario[field] = value;
  });
  funcionario.updatedBy = user.id;

  try {
    await funcionario.save();
  } catch (error) {
    handleDuplicateMongoError(error);
  }

  const updatedFuncionario = await Funcionario.findById(funcionario._id).populate(
    funcionarioPopulateConfig,
  );

  return mapFuncionario(updatedFuncionario);
};

const inactivateFuncionario = async (id, user) => {
  ensureAuthenticatedUser(user);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new FuncionarioServiceError(422, "Funcionario invalido.");
  }

  const funcionario = await Funcionario.findById(id);

  if (!funcionario) {
    throw new FuncionarioServiceError(404, "Funcionario nao encontrado.");
  }

  if (funcionario.status === "Inativo") {
    const inactiveFuncionario = await Funcionario.findById(funcionario._id).populate(
      funcionarioPopulateConfig,
    );

    return {
      funcionario: mapFuncionario(inactiveFuncionario),
      changed: false,
    };
  }

  funcionario.status = "Inativo";
  funcionario.inactivatedBy = user.id;
  funcionario.inactivatedAt = new Date();
  funcionario.updatedBy = user.id;

  await funcionario.save();

  const inactiveFuncionario = await Funcionario.findById(funcionario._id).populate(
    funcionarioPopulateConfig,
  );

  return {
    funcionario: mapFuncionario(inactiveFuncionario),
    changed: true,
  };
};

module.exports = {
  FuncionarioServiceError,
  createFuncionario,
  getFuncionarioById,
  inactivateFuncionario,
  listFuncionarios,
  updateFuncionario,
};
