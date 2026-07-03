const mongoose = require("mongoose");
const CentroCusto = require("../../models/CentroCusto");
const CentroCustoMovimentacao = require("../../models/CentroCustoMovimentacao");
const Funcionario = require("../../models/Funcionario");
const {
  normalizeCentroCustoKey,
  normalizeCentroCustoNome,
} = require("../helpers/centroCusto");

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

class CentroCustoServiceError extends Error {
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
    throw new CentroCustoServiceError(
      401,
      "Usuario autenticado nao identificado.",
    );
  }
};

const validateObjectId = (id, message) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new CentroCustoServiceError(422, message);
  }
};

const parsePositiveInteger = (value, fallback, fieldName) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    throw new CentroCustoServiceError(
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

const mapCentroCusto = (centroCusto) => ({
  _id: centroCusto._id,
  nome: centroCusto.nome,
  createdBy: mapUser(centroCusto.createdBy),
  updatedBy: mapUser(centroCusto.updatedBy),
  createdAt: centroCusto.createdAt,
  updatedAt: centroCusto.updatedAt,
});

const centroCustoPopulateConfig = [
  { path: "createdBy", select: "_id name email" },
  { path: "updatedBy", select: "_id name email" },
];

const buildExactCentroCustoRegex = (nome) =>
  new RegExp(`^\\s*${escapeRegex(nome)}\\s*$`, "i");

const buildCentroCustoFilters = (query = {}) => {
  const filters = {};
  const search = normalizeText(query.search || query.q);

  if (search) {
    filters.$or = [
      { nome: new RegExp(escapeRegex(search), "i") },
      {
        nomeNormalizado: new RegExp(
          escapeRegex(normalizeCentroCustoKey(search)),
          "i",
        ),
      },
    ];
  }

  return filters;
};

const ensureNomeIsValid = (nome) => {
  const normalizedNome = normalizeCentroCustoNome(nome);

  if (!normalizedNome) {
    throw new CentroCustoServiceError(
      422,
      "O nome do centro de custo e obrigatorio.",
    );
  }

  return normalizedNome;
};

const ensureNomeIsAvailable = async (nome, ignoredCentroCustoId = null) => {
  const filters = {
    nomeNormalizado: normalizeCentroCustoKey(nome),
  };

  if (ignoredCentroCustoId) {
    filters._id = { $ne: ignoredCentroCustoId };
  }

  const existingCentroCusto = await CentroCusto.findOne(filters).select(
    "+nomeNormalizado",
  );

  if (existingCentroCusto) {
    throw new CentroCustoServiceError(
      409,
      "Ja existe centro de custo com este nome.",
      {
        centroCusto: mapCentroCusto(existingCentroCusto),
      },
    );
  }
};

const handleDuplicateMongoError = (error) => {
  if (error?.code === 11000) {
    throw new CentroCustoServiceError(
      409,
      "Ja existe centro de custo com este nome.",
    );
  }

  throw error;
};

const listCentrosCusto = async (query = {}) => {
  const filters = buildCentroCustoFilters(query);
  const { page, limit } = getPagination(query);
  const skip = (page - 1) * limit;

  const [centrosCusto, total] = await Promise.all([
    CentroCusto.find(filters)
      .populate(centroCustoPopulateConfig)
      .collation({ locale: "pt", strength: 1, numericOrdering: true })
      .sort({ nome: 1 })
      .skip(skip)
      .limit(limit),
    CentroCusto.countDocuments(filters),
  ]);

  return {
    centrosCusto: centrosCusto.map(mapCentroCusto),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const listCentrosCustoOptions = async () => {
  const centrosCusto = await CentroCusto.find({})
    .select("nome")
    .collation({ locale: "pt", strength: 1, numericOrdering: true })
    .sort({ nome: 1 });

  return {
    centrosCusto: centrosCusto.map((centroCusto) => centroCusto.nome),
  };
};

const getCentroCustoById = async (id) => {
  validateObjectId(id, "Centro de custo invalido.");

  const centroCusto = await CentroCusto.findById(id).populate(
    centroCustoPopulateConfig,
  );

  if (!centroCusto) {
    throw new CentroCustoServiceError(404, "Centro de custo nao encontrado.");
  }

  return mapCentroCusto(centroCusto);
};

const createCentroCusto = async (payload = {}, user) => {
  ensureAuthenticatedUser(user);

  const nome = ensureNomeIsValid(payload.nome);
  await ensureNomeIsAvailable(nome);

  try {
    const centroCusto = await CentroCusto.create({
      nome,
      createdBy: user.id,
    });
    const createdCentroCusto = await CentroCusto.findById(
      centroCusto._id,
    ).populate(centroCustoPopulateConfig);

    return mapCentroCusto(createdCentroCusto);
  } catch (error) {
    handleDuplicateMongoError(error);
  }
};

const updateCentroCusto = async (id, payload = {}, user) => {
  ensureAuthenticatedUser(user);
  validateObjectId(id, "Centro de custo invalido.");

  const nome = ensureNomeIsValid(payload.nome);
  const centroCusto = await CentroCusto.findById(id).select(
    "+nomeNormalizado",
  );

  if (!centroCusto) {
    throw new CentroCustoServiceError(404, "Centro de custo nao encontrado.");
  }

  await ensureNomeIsAvailable(nome, centroCusto._id);

  const nomeAnterior = centroCusto.nome;
  const shouldUpdateFuncionarios = nomeAnterior !== nome;

  centroCusto.nome = nome;
  centroCusto.updatedBy = user.id;

  try {
    await centroCusto.save();
  } catch (error) {
    handleDuplicateMongoError(error);
  }

  let funcionariosAtualizados = 0;

  if (shouldUpdateFuncionarios) {
    const updateResult = await Funcionario.updateMany(
      { centroCusto: buildExactCentroCustoRegex(nomeAnterior) },
      {
        $set: {
          centroCusto: nome,
          updatedBy: user.id,
        },
      },
    );

    funcionariosAtualizados =
      updateResult.modifiedCount ?? updateResult.nModified ?? 0;
  }

  const updatedCentroCusto = await CentroCusto.findById(centroCusto._id).populate(
    centroCustoPopulateConfig,
  );

  return {
    centroCusto: mapCentroCusto(updatedCentroCusto),
    funcionariosAtualizados,
  };
};

const deleteCentroCusto = async (id) => {
  validateObjectId(id, "Centro de custo invalido.");

  const centroCusto = await CentroCusto.findById(id);

  if (!centroCusto) {
    throw new CentroCustoServiceError(404, "Centro de custo nao encontrado.");
  }

  const centroCustoRegex = buildExactCentroCustoRegex(centroCusto.nome);
  const [funcionariosEmUso, movimentacoesEmUso] = await Promise.all([
    Funcionario.countDocuments({ centroCusto: centroCustoRegex }),
    CentroCustoMovimentacao.countDocuments({
      $or: [
        { centroCustoAnterior: centroCustoRegex },
        { novoCentroCusto: centroCustoRegex },
      ],
    }),
  ]);

  if (funcionariosEmUso || movimentacoesEmUso) {
    throw new CentroCustoServiceError(
      409,
      "Nao foi possivel excluir o centro de custo porque ele esta em uso.",
      {
        centroCusto: {
          _id: centroCusto._id,
          nome: centroCusto.nome,
        },
        motivoBloqueio: {
          funcionariosEmUso,
          movimentacoesEmUso,
        },
      },
    );
  }

  await CentroCusto.deleteOne({ _id: centroCusto._id });

  return {
    centroCusto: {
      _id: centroCusto._id,
      nome: centroCusto.nome,
    },
  };
};

module.exports = {
  CentroCustoServiceError,
  createCentroCusto,
  deleteCentroCusto,
  getCentroCustoById,
  listCentrosCusto,
  listCentrosCustoOptions,
  updateCentroCusto,
};
