const mongoose = require("mongoose");
const fs = require("fs/promises");
const Funcionario = require("../../models/Funcionario");
const { normalizeCpf, validateCpf } = require("../helpers/cpf");

const FUNCIONARIO_STATUSES = ["Ativo", "Inativo"];
const FUNCIONARIO_ORIGENS = ["Manual", "Importacao CSV"];
const EDITABLE_FIELDS = ["nome", "cpf", "centroCusto"];
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;
const MAX_CSV_FILE_SIZE_BYTES = 2 * 1024 * 1024;
const IMPORT_ORIGIN = "Importacao CSV";
const FUNCIONARIOS_EXPORT_FILE_NAME = "funcionarios-centro-custo.csv";
const REQUIRED_CSV_COLUMNS = {
  nome: "Nome",
  cpf: "CPF",
  centroCusto: "Centro de Custo",
};

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

const normalizeHeader = (value = "") =>
  String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const escapeCsvCell = (value) => {
  const text = String(value ?? "");
  const safeText = /^[=+\-@]/.test(text.trimStart()) ? `'${text}` : text;
  const escapedText = safeText.replace(/"/g, '""');

  return /[";\r\n]/.test(escapedText) ? `"${escapedText}"` : escapedText;
};

const buildCsvContent = (rows = []) =>
  `\uFEFF${rows
    .map((row) => row.map(escapeCsvCell).join(";"))
    .join("\r\n")}`;

const formatCsvDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(date);
};

const formatCpfForExport = (value = "") => {
  const digits = normalizeCpf(value);

  if (digits.length !== 11) {
    return value || "";
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(
    6,
    9,
  )}-${digits.slice(9)}`;
};

const formatOrigemForExport = (value = "") => {
  if (value === IMPORT_ORIGIN) {
    return "Importação CSV";
  }

  return value || "";
};

const ensureAuthenticatedUser = (user) => {
  if (!user?.id) {
    throw new FuncionarioServiceError(
      401,
      "Usuário autenticado não identificado.",
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

const getUserExportName = (user) => {
  if (!user) return "";

  return user.name || user.email || "";
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
      throw new FuncionarioServiceError(422, "Status de funcionário inválido.");
    }

    filters.status = status;
  }

  if (centroCusto) {
    filters.centroCusto = new RegExp(
      `^\\s*${escapeRegex(centroCusto)}\\s*$`,
      "i",
    );
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
    throw new FuncionarioServiceError(409, "Já existe funcionário com este CPF.", {
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
    throw new FuncionarioServiceError(422, "O nome é obrigatório.");
  }

  if (!centroCusto) {
    throw new FuncionarioServiceError(422, "O centro de custo é obrigatório.");
  }

  if (payload.status !== undefined && payload.status !== null && payload.status !== "") {
    const status = normalizeStatus(payload.status);

    if (!status) {
      throw new FuncionarioServiceError(422, "Status de funcionário inválido.");
    }
  }

  if (payload.origem !== undefined && payload.origem !== null && payload.origem !== "") {
    const origem = normalizeOrigem(payload.origem);

    if (!origem) {
      throw new FuncionarioServiceError(422, "Origem de funcionário inválida.");
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
      throw new FuncionarioServiceError(422, "O nome é obrigatório.");
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
        "O centro de custo é obrigatório.",
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
      "Já existe funcionário com este CPF.",
    );
  }

  throw error;
};

const getCsvFilePath = (file) => file?.filepath || file?.path;

const getUploadedFile = (files = {}) => {
  const preferredFile = files.file || files.csv || files.arquivo;
  const file = Array.isArray(preferredFile) ? preferredFile[0] : preferredFile;

  if (file) {
    return file;
  }

  const firstFile = Object.values(files)[0];
  return Array.isArray(firstFile) ? firstFile[0] : firstFile;
};

const removeUploadedFile = async (file) => {
  const filePath = getCsvFilePath(file);

  if (!filePath) {
    return;
  }

  try {
    await fs.unlink(filePath);
  } catch {
    // O arquivo temporario pode ja ter sido removido pelo ambiente.
  }
};

const decodeCsvBuffer = (buffer) => {
  const utf8Text = buffer.toString("utf8");

  if (!utf8Text.includes("\uFFFD")) {
    return utf8Text;
  }

  return buffer.toString("latin1");
};

const readUploadedCsv = async (files = {}) => {
  const file = getUploadedFile(files);
  const filePath = getCsvFilePath(file);

  if (!file || !filePath) {
    throw new FuncionarioServiceError(
      422,
      "Envie um arquivo CSV no campo file.",
    );
  }

  if (file.size > MAX_CSV_FILE_SIZE_BYTES) {
    await removeUploadedFile(file);
    throw new FuncionarioServiceError(
      413,
      "Arquivo CSV excede o limite de 2MB.",
    );
  }

  try {
    const csvBuffer = await fs.readFile(filePath);
    const csvText = decodeCsvBuffer(csvBuffer);

    if (!normalizeText(csvText)) {
      throw new FuncionarioServiceError(422, "Arquivo CSV vazio.");
    }

    return csvText;
  } finally {
    await removeUploadedFile(file);
  }
};

const countDelimiterOutsideQuotes = (line = "", delimiter) => {
  let count = 0;
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (!insideQuotes && char === delimiter) {
      count += 1;
    }
  }

  return count;
};

const detectCsvDelimiter = (csvText = "") => {
  const firstLine =
    String(csvText).replace(/^\uFEFF/, "").split(/\r?\n/)[0] || "";
  const semicolonCount = countDelimiterOutsideQuotes(firstLine, ";");
  const commaCount = countDelimiterOutsideQuotes(firstLine, ",");

  return semicolonCount >= commaCount ? ";" : ",";
};

const parseCsvRows = (csvText = "", delimiter = ";") => {
  const text = String(csvText).replace(/^\uFEFF/, "");
  const rows = [];
  let row = [];
  let field = "";
  let insideQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        field += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (!insideQuotes && char === delimiter) {
      row.push(field);
      field = "";
      continue;
    }

    if (!insideQuotes && char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    if (!insideQuotes && char === "\r") {
      continue;
    }

    field += char;
  }

  row.push(field);
  rows.push(row);

  return rows;
};

const rowIsBlank = (row = []) =>
  row.every((cell) => !normalizeText(cell));

const getHeaderConfig = (rows = []) => {
  const headerIndex = rows.findIndex((row) => !rowIsBlank(row));

  if (headerIndex === -1) {
    throw new FuncionarioServiceError(422, "Arquivo CSV sem cabeçalho.");
  }

  const headerRow = rows[headerIndex];
  const columnMap = {};

  headerRow.forEach((header, index) => {
    const normalizedHeader = normalizeHeader(header);

    if (normalizedHeader === "nome") {
      columnMap.nome = index;
    }

    if (normalizedHeader === "cpf") {
      columnMap.cpf = index;
    }

    if (
      normalizedHeader === "centrodecusto" ||
      normalizedHeader === "centrocusto"
    ) {
      columnMap.centroCusto = index;
    }
  });

  const missingColumns = Object.entries(REQUIRED_CSV_COLUMNS)
    .filter(([key]) => columnMap[key] === undefined)
    .map(([, label]) => label);

  if (missingColumns.length) {
    throw new FuncionarioServiceError(
      422,
      "CSV sem colunas obrigatórias.",
      { missingColumns },
    );
  }

  return {
    headerIndex,
    columnMap,
  };
};

const getCsvCell = (row, index) => normalizeText(row[index]);

const getRowsWithDuplicateCpf = (rows = []) => {
  const rowsByCpf = rows.reduce((accumulator, row) => {
    if (!row.cpf) {
      return accumulator;
    }

    return {
      ...accumulator,
      [row.cpf]: [...(accumulator[row.cpf] || []), row.row],
    };
  }, {});

  return new Set(
    Object.values(rowsByCpf)
      .filter((rowNumbers) => rowNumbers.length > 1)
      .flat(),
  );
};

const getCsvDataRows = (rows, headerIndex, columnMap) =>
  rows
    .map((row, index) => ({
      rowNumber: index + 1,
      row,
    }))
    .slice(headerIndex + 1)
    .filter(({ row }) => !rowIsBlank(row))
    .map(({ rowNumber, row }) => {
      const nome = getCsvCell(row, columnMap.nome);
      const rawCpf = getCsvCell(row, columnMap.cpf);
      const centroCusto = getCsvCell(row, columnMap.centroCusto);
      const errors = [];
      let cpf = "";

      if (!nome) {
        errors.push("Nome obrigatório");
      }

      if (!rawCpf) {
        errors.push("CPF obrigatório");
      } else {
        const cpfResult = validateCpf(rawCpf);

        if (!cpfResult.ok) {
          errors.push("CPF inválido");
        } else {
          cpf = cpfResult.cpf;
        }
      }

      if (!centroCusto) {
        errors.push("Centro de custo obrigatório");
      }

      return {
        row: rowNumber,
        nome,
        cpf,
        centroCusto,
        errors,
      };
    });

const buildCsvImportPreview = async (csvText) => {
  const delimiter = detectCsvDelimiter(csvText);
  const rows = parseCsvRows(csvText, delimiter);
  const { headerIndex, columnMap } = getHeaderConfig(rows);
  const csvRows = getCsvDataRows(rows, headerIndex, columnMap);
  const duplicateRows = getRowsWithDuplicateCpf(csvRows);

  const rowsWithDuplicates = csvRows.map((row) => ({
    ...row,
    errors: duplicateRows.has(row.row)
      ? [...row.errors, "CPF duplicado no arquivo"]
      : row.errors,
  }));
  const validCpfs = [
    ...new Set(
      rowsWithDuplicates
        .filter((row) => row.errors.length === 0)
        .map((row) => row.cpf),
    ),
  ];
  const existingFuncionarios = validCpfs.length
    ? await Funcionario.find({ cpf: { $in: validCpfs } }).select("_id cpf")
    : [];
  const existingCpfs = new Set(
    existingFuncionarios.map((funcionario) => funcionario.cpf),
  );
  const preview = rowsWithDuplicates.map((row) => {
    const action = row.errors.length
      ? "error"
      : existingCpfs.has(row.cpf)
        ? "update"
        : "create";

    return {
      ...row,
      action,
    };
  });
  const errors = preview
    .filter((row) => row.errors.length)
    .map(({ row, errors: rowErrors }) => ({
      row,
      errors: rowErrors,
    }));

  return {
    summary: {
      totalRows: preview.length,
      validRows: preview.filter((row) => row.errors.length === 0).length,
      createCount: preview.filter((row) => row.action === "create").length,
      updateCount: preview.filter((row) => row.action === "update").length,
      errorCount: errors.length,
      duplicateCount: duplicateRows.size,
    },
    preview,
    errors,
  };
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

const listCentrosCustoFuncionarios = async () => {
  const centrosCusto = await Funcionario.distinct("centroCusto");
  const uniqueCentrosCusto = new Map();

  centrosCusto.forEach((value) => {
    const centroCusto = normalizeText(value);

    if (!centroCusto) {
      return;
    }

    const key = centroCusto.toLocaleLowerCase("pt-BR");

    if (!uniqueCentrosCusto.has(key)) {
      uniqueCentrosCusto.set(key, centroCusto);
    }
  });

  return {
    centrosCusto: Array.from(uniqueCentrosCusto.values()).sort((first, second) =>
      first.localeCompare(second, "pt-BR", {
        numeric: true,
        sensitivity: "base",
      }),
    ),
  };
};

const exportFuncionariosCsv = async (query = {}) => {
  const filters = buildFuncionarioFilters(query);
  const funcionarios = await Funcionario.find(filters)
    .populate(funcionarioPopulateConfig)
    .sort({ nome: 1, createdAt: -1 });
  const rows = [
    [
      "Nome",
      "CPF",
      "Centro de Custo",
      "Status",
      "Origem",
      "Criado Por",
      "Atualizado Por",
      "Inativado Por",
      "Criado Em",
      "Atualizado Em",
      "Inativado Em",
    ],
    ...funcionarios.map((funcionario) => [
      funcionario.nome,
      formatCpfForExport(funcionario.cpf),
      funcionario.centroCusto,
      funcionario.status,
      formatOrigemForExport(funcionario.origem),
      getUserExportName(funcionario.createdBy),
      getUserExportName(funcionario.updatedBy),
      getUserExportName(funcionario.inactivatedBy),
      formatCsvDate(funcionario.createdAt),
      formatCsvDate(funcionario.updatedAt),
      formatCsvDate(funcionario.inactivatedAt),
    ]),
  ];

  return {
    fileName: FUNCIONARIOS_EXPORT_FILE_NAME,
    content: buildCsvContent(rows),
  };
};

const getFuncionarioById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new FuncionarioServiceError(422, "Funcionário inválido.");
  }

  const funcionario = await Funcionario.findById(id).populate(
    funcionarioPopulateConfig,
  );

  if (!funcionario) {
    throw new FuncionarioServiceError(404, "Funcionário não encontrado.");
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
    throw new FuncionarioServiceError(422, "Funcionário inválido.");
  }

  const updatePayload = getUpdatePayload(payload);
  const funcionario = await Funcionario.findById(id);

  if (!funcionario) {
    throw new FuncionarioServiceError(404, "Funcionário não encontrado.");
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
    throw new FuncionarioServiceError(422, "Funcionário inválido.");
  }

  const funcionario = await Funcionario.findById(id);

  if (!funcionario) {
    throw new FuncionarioServiceError(404, "Funcionário não encontrado.");
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

const previewFuncionariosCsvImport = async (files = {}) => {
  const csvText = await readUploadedCsv(files);

  return buildCsvImportPreview(csvText);
};

const importFuncionariosCsv = async (files = {}, user) => {
  ensureAuthenticatedUser(user);

  const csvText = await readUploadedCsv(files);
  const previewResult = await buildCsvImportPreview(csvText);

  if (previewResult.summary.errorCount > 0) {
    throw new FuncionarioServiceError(
      422,
      "CSV possui erros e não foi importado.",
      previewResult,
    );
  }

  const validRows = previewResult.preview.filter(
    (row) => row.errors.length === 0,
  );
  const cpfs = validRows.map((row) => row.cpf);
  const existingFuncionarios = cpfs.length
    ? await Funcionario.find({ cpf: { $in: cpfs } })
    : [];
  const funcionariosByCpf = new Map(
    existingFuncionarios.map((funcionario) => [funcionario.cpf, funcionario]),
  );
  let createdCount = 0;
  let updatedCount = 0;

  for (const row of validRows) {
    const existingFuncionario = funcionariosByCpf.get(row.cpf);

    if (existingFuncionario) {
      existingFuncionario.nome = row.nome;
      existingFuncionario.centroCusto = row.centroCusto;
      existingFuncionario.origem = IMPORT_ORIGIN;
      existingFuncionario.updatedBy = user.id;

      await existingFuncionario.save();
      updatedCount += 1;
      continue;
    }

    await Funcionario.create({
      nome: row.nome,
      cpf: row.cpf,
      centroCusto: row.centroCusto,
      status: "Ativo",
      origem: IMPORT_ORIGIN,
      createdBy: user.id,
    });
    createdCount += 1;
  }

  return {
    message: "Importação concluída com sucesso.",
    summary: {
      totalRows: previewResult.summary.totalRows,
      createdCount,
      updatedCount,
      errorCount: 0,
    },
  };
};

module.exports = {
  FuncionarioServiceError,
  createFuncionario,
  exportFuncionariosCsv,
  getFuncionarioById,
  importFuncionariosCsv,
  inactivateFuncionario,
  listCentrosCustoFuncionarios,
  listFuncionarios,
  previewFuncionariosCsvImport,
  updateFuncionario,
};
