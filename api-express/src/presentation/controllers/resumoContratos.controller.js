const mongoose = require("mongoose");
const Cliente = require("../../../models/Cliente");
const ResumoContrato = require("../../../models/ResumoContrato");
const ResumoContratoBm = require("../../../models/ResumoContratoBm");

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

const hasOwn = (object, key) =>
  Object.prototype.hasOwnProperty.call(object || {}, key);

const UNASSIGNED_CLIENT_ID = "__sem_cliente__";
const getCurrentYear = () => new Date().getFullYear();

const getIdText = (value) => {
  if (value && typeof value === "object" && value._id) {
    return String(value._id).trim();
  }

  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
};

const getSafeNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const normalizeNumericText = (value) => {
  const text = String(value || "").trim().replace(/\s/g, "");

  if (text.includes(",")) {
    const lastCommaIndex = text.lastIndexOf(",");
    const lastDotIndex = text.lastIndexOf(".");

    if (lastCommaIndex > lastDotIndex) {
      return text.replace(/\./g, "").replace(",", ".");
    }

    return text.replace(/,/g, "");
  }

  return text;
};

const parseNumber = (value, fieldLabel, defaultValue = 0) => {
  if (value === undefined || value === null || value === "") {
    return {
      ok: true,
      value: defaultValue,
    };
  }

  let parsedValue;

  if (typeof value === "number") {
    parsedValue = value;
  } else if (typeof value === "string") {
    const normalizedValue = normalizeNumericText(value);
    parsedValue = normalizedValue ? Number(normalizedValue) : defaultValue;
  } else {
    return {
      ok: false,
      status: 422,
      msg: `${fieldLabel} precisa ser numerico.`,
    };
  }

  if (!Number.isFinite(parsedValue)) {
    return {
      ok: false,
      status: 422,
      msg: `${fieldLabel} invalido.`,
    };
  }

  return {
    ok: true,
    value: parsedValue,
  };
};

const parseYear = (value) => {
  const result = parseNumber(value, "Ano", getCurrentYear());

  if (!result.ok) {
    return result;
  }

  if (!Number.isInteger(result.value) || result.value <= 0) {
    return {
      ok: false,
      status: 422,
      msg: "Ano invalido.",
    };
  }

  return result;
};

const parseOptionalYear = (value) => {
  if (value === undefined || value === null || value === "") {
    return {
      ok: true,
      value: null,
    };
  }

  return parseYear(value);
};

const parseOptionalText = (value, fieldLabel) => {
  if (value === undefined || value === null) {
    return {
      ok: true,
      value: "",
    };
  }

  if (typeof value !== "string") {
    return {
      ok: false,
      status: 422,
      msg: `${fieldLabel} precisa ser texto.`,
    };
  }

  return {
    ok: true,
    value: value.trim(),
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
      status: 422,
      msg: `${fieldLabel} invalida.`,
    };
  }

  return {
    ok: true,
    value: date,
  };
};

const parseRequiredMonth = (value) => {
  const result = parseNumber(value, "Mes");

  if (!result.ok) {
    return result;
  }

  if (
    !Number.isInteger(result.value) ||
    result.value < 1 ||
    result.value > 12
  ) {
    return {
      ok: false,
      status: 422,
      msg: "Mes do BM invalido.",
    };
  }

  return result;
};

const parseClienteId = (value, required = false) => {
  const clienteId = getIdText(value);

  if (!clienteId) {
    if (required) {
      return {
        ok: false,
        status: 422,
        msg: "Cliente e obrigatorio.",
      };
    }

    return {
      ok: true,
      value: null,
    };
  }

  if (!mongoose.Types.ObjectId.isValid(clienteId)) {
    return {
      ok: false,
      status: 422,
      msg: "Cliente invalido.",
    };
  }

  return {
    ok: true,
    value: clienteId,
  };
};

const getBmPayload = (body = {}, options = {}) => {
  const payload = {};
  const shouldReadField = (fieldName) =>
    !options.partial || hasOwn(body, fieldName);

  if (shouldReadField("ano")) {
    const result = parseYear(body.ano);
    if (!result.ok) return result;
    payload.ano = result.value;
  }

  if (shouldReadField("mes")) {
    const result = parseRequiredMonth(body.mes);
    if (!result.ok) return result;
    payload.mes = result.value;
  }

  if (shouldReadField("bm")) {
    const result = parseOptionalText(body.bm, "BM");
    if (!result.ok) return result;
    payload.bm = result.value;
  }

  if (shouldReadField("bmInicio")) {
    const result = parseOptionalDate(body.bmInicio, "Inicio do ciclo do BM");
    if (!result.ok) return result;
    payload.bmInicio = result.value;
  }

  if (shouldReadField("bmFim")) {
    const result = parseOptionalDate(body.bmFim, "Fim do ciclo do BM");
    if (!result.ok) return result;
    payload.bmFim = result.value;
  }

  if (shouldReadField("valorBm")) {
    const result = parseNumber(body.valorBm, "Valor do BM", 0);
    if (!result.ok) return result;
    payload.valorBm = result.value;
  }

  if (shouldReadField("faturadoData")) {
    const result = parseOptionalDate(body.faturadoData, "Data de faturamento");
    if (!result.ok) return result;
    payload.faturadoData = result.value;
  }

  return {
    ok: true,
    payload,
  };
};

const getContratoPayload = (body = {}, options = {}) => {
  const payload = {};
  const shouldReadField = (fieldName) =>
    !options.partial || hasOwn(body, fieldName);

  if (shouldReadField("clienteId")) {
    const result = parseClienteId(body.clienteId, options.requireCliente);
    if (!result.ok) return result;
    payload.clienteId = result.value;
  }

  if (shouldReadField("nomeContrato")) {
    const result = parseOptionalText(body.nomeContrato, "Nome do contrato");
    if (!result.ok) return result;
    payload.nomeContrato = result.value;
  }

  if (shouldReadField("orcamento")) {
    const result = parseNumber(body.orcamento, "Orcamento", 0);
    if (!result.ok) return result;
    payload.orcamento = result.value;
  }

  if (shouldReadField("dataInicio")) {
    const result = parseOptionalDate(body.dataInicio, "Data de inicio");
    if (!result.ok) return result;
    payload.dataInicio = result.value;
  }

  if (shouldReadField("dataFim")) {
    const result = parseOptionalDate(body.dataFim, "Data de fim");
    if (!result.ok) return result;
    payload.dataFim = result.value;
  }

  return {
    ok: true,
    payload,
  };
};

const getGap = (dataFim) => {
  if (!dataFim) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endDate = new Date(dataFim);
  endDate.setHours(0, 0, 0, 0);

  const diffInDays = Math.ceil((endDate.getTime() - today.getTime()) / MS_PER_DAY);

  return Math.max(diffInDays, 0);
};

const getCards = (orcamento, bm) => ({
  saldo: orcamento - bm,
  bm,
  orcamento,
});

const mapClienteBrief = (cliente) => {
  if (!cliente || !cliente._id) {
    return null;
  }

  return {
    id: String(cliente._id),
    nome: cliente.nome || "",
  };
};

const getContratoClienteId = (contrato) => {
  const clienteId = contrato?.clienteId?._id || contrato?.clienteId;
  return clienteId ? String(clienteId) : null;
};

const validateClienteExists = async (clienteId) => {
  if (!clienteId) {
    return {
      ok: true,
    };
  }

  const cliente = await Cliente.findById(clienteId);

  if (!cliente) {
    return {
      ok: false,
      status: 422,
      msg: "Cliente nao encontrado.",
    };
  }

  return {
    ok: true,
  };
};

const mapBmResponse = (bm) => ({
  id: String(bm._id),
  _id: bm._id,
  contratoId: String(bm.contratoId),
  ano: bm.ano,
  mes: bm.mes,
  bm: bm.bm || "",
  bmInicio: bm.bmInicio || null,
  bmFim: bm.bmFim || null,
  valorBm: getSafeNumber(bm.valorBm),
  faturadoData: bm.faturadoData || null,
  createdAt: bm.createdAt,
  updatedAt: bm.updatedAt,
});

const mapContratoResponse = (contrato) => ({
  id: String(contrato._id),
  clienteId: getContratoClienteId(contrato),
  cliente: mapClienteBrief(contrato.clienteId),
  nomeContrato: contrato.nomeContrato ?? "",
  orcamento: getSafeNumber(contrato.orcamento),
  dataInicio: contrato.dataInicio || null,
  dataFim: contrato.dataFim || null,
  createdAt: contrato.createdAt,
  updatedAt: contrato.updatedAt,
});

const mapContratoResumoResponse = (contrato, bm) => {
  const orcamento = getSafeNumber(contrato.orcamento);

  return {
    id: String(contrato._id),
    clienteId: getContratoClienteId(contrato),
    cliente: mapClienteBrief(contrato.clienteId),
    nomeContrato: contrato.nomeContrato ?? "",
    orcamento,
    bm,
    saldo: orcamento - bm,
    dataInicio: contrato.dataInicio || null,
    dataFim: contrato.dataFim || null,
    gap: getGap(contrato.dataFim),
  };
};

const findResumoContratoById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return {
      ok: false,
      status: 422,
      msg: "Contrato invalido.",
    };
  }

  const contrato = await ResumoContrato.findById(id).populate({
    path: "clienteId",
    select: "nome",
  });

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

const getBmTotalsByContract = async (contratoIds, ano) => {
  if (!contratoIds.length) {
    return new Map();
  }

  const totals = await ResumoContratoBm.aggregate([
    {
      $match: {
        contratoId: { $in: contratoIds },
        ano,
      },
    },
    {
      $group: {
        _id: "$contratoId",
        total: { $sum: "$valorBm" },
      },
    },
  ]);

  return new Map(
    totals.map((item) => [String(item._id), getSafeNumber(item.total)]),
  );
};

const getBmsDoContrato = async (contratoId, ano) => {
  const bms = await ResumoContratoBm.find({ contratoId, ano }).sort({
    mes: 1,
    createdAt: 1,
  });

  return bms.map(mapBmResponse);
};

const getBmsPorMesFromList = (bms = []) => {
  const bmsPorMes = MONTHS.reduce((acc, mes) => {
    acc[String(mes)] = 0;
    return acc;
  }, {});

  bms.forEach((bm) => {
    bmsPorMes[String(bm.mes)] += getSafeNumber(bm.valorBm);
  });

  return bmsPorMes;
};

const getContratoDetailResponse = async (contrato, ano) => {
  const bms = await getBmsDoContrato(contrato._id, ano);
  const bm = bms.reduce(
    (total, item) => total + getSafeNumber(item.valorBm),
    0,
  );
  const orcamento = getSafeNumber(contrato.orcamento);

  return {
    ano,
    contrato: {
      id: String(contrato._id),
      clienteId: getContratoClienteId(contrato),
      cliente: mapClienteBrief(contrato.clienteId),
      nomeContrato: contrato.nomeContrato ?? "",
      orcamento,
      dataInicio: contrato.dataInicio || null,
      dataFim: contrato.dataFim || null,
      bm,
      saldo: orcamento - bm,
      gap: getGap(contrato.dataFim),
    },
    cards: getCards(orcamento, bm),
    bms,
    bmsPorMes: getBmsPorMesFromList(bms),
  };
};

const parseExportClienteId = (value) => {
  const clienteId = getIdText(value);

  if (!clienteId) {
    return {
      ok: true,
      value: null,
      isUnassigned: false,
    };
  }

  if (clienteId === UNASSIGNED_CLIENT_ID) {
    return {
      ok: true,
      value: UNASSIGNED_CLIENT_ID,
      isUnassigned: true,
    };
  }

  const result = parseClienteId(clienteId, true);

  if (!result.ok) {
    return result;
  }

  return {
    ok: true,
    value: result.value,
    isUnassigned: false,
  };
};

const getContractClienteIdKey = (contrato) =>
  getContratoClienteId(contrato) || UNASSIGNED_CLIENT_ID;

const createClienteOnlyExportRow = (cliente) => ({
  clienteId: cliente ? String(cliente._id || cliente.id || "") : null,
  clienteNome: cliente?.nome || "Sem cliente definido",
  contratoId: null,
  nomeContrato: "",
  orcamento: null,
  bmTotal: null,
  saldo: null,
  dataInicio: null,
  dataFim: null,
  gap: null,
  bmId: null,
  ano: null,
  mes: null,
  bm: "",
  bmInicio: null,
  bmFim: null,
  valorBm: null,
  faturadoData: null,
  statusFaturamento: "",
});

const createContratoExportBase = (contrato, bmTotal, clienteName) => {
  const orcamento = getSafeNumber(contrato.orcamento);

  return {
    clienteId: getContratoClienteId(contrato),
    clienteNome:
      clienteName || contrato?.clienteId?.nome || "Sem cliente definido",
    contratoId: String(contrato._id),
    nomeContrato: contrato.nomeContrato ?? "",
    orcamento,
    bmTotal,
    saldo: orcamento - bmTotal,
    dataInicio: contrato.dataInicio || null,
    dataFim: contrato.dataFim || null,
    gap: getGap(contrato.dataFim),
  };
};

const createContratoWithoutBmExportRow = (contrato, bmTotal, clienteName, ano) => ({
  ...createContratoExportBase(contrato, bmTotal, clienteName),
  bmId: null,
  ano,
  mes: null,
  bm: "",
  bmInicio: null,
  bmFim: null,
  valorBm: null,
  faturadoData: null,
  statusFaturamento: "",
});

const createBmExportRow = (contrato, bm, bmTotal, clienteName) => ({
  ...createContratoExportBase(contrato, bmTotal, clienteName),
  bmId: String(bm._id),
  ano: bm.ano,
  mes: bm.mes,
  bm: bm.bm || "",
  bmInicio: bm.bmInicio || null,
  bmFim: bm.bmFim || null,
  valorBm: getSafeNumber(bm.valorBm),
  faturadoData: bm.faturadoData || null,
  statusFaturamento: bm.faturadoData ? "Faturado" : "Nao faturado",
});

const appendContratoExportRows = ({
  rows,
  contrato,
  clienteName,
  bmsByContratoId,
  bmTotalsByContratoId,
  ano,
}) => {
  const contratoId = String(contrato._id);
  const contratoBms = bmsByContratoId.get(contratoId) || [];
  const bmTotal = bmTotalsByContratoId.get(contratoId) || 0;

  if (!contratoBms.length) {
    rows.push(
      createContratoWithoutBmExportRow(contrato, bmTotal, clienteName, ano),
    );
    return;
  }

  contratoBms.forEach((bm) => {
    rows.push(createBmExportRow(contrato, bm, bmTotal, clienteName));
  });
};

const getResumoContratosExportRows = async ({ clienteId, isUnassigned, ano }) => {
  const contratoFilter = {};

  if (isUnassigned) {
    contratoFilter.$or = [{ clienteId: null }, { clienteId: { $exists: false } }];
  } else if (clienteId) {
    contratoFilter.clienteId = clienteId;
  }

  const clienteFilter =
    clienteId && !isUnassigned ? { _id: clienteId } : {};

  const [clientes, contratos] = await Promise.all([
    isUnassigned ? [] : Cliente.find(clienteFilter).sort({ nome: 1 }),
    ResumoContrato.find(contratoFilter)
      .populate({ path: "clienteId", select: "nome" })
      .sort({ nomeContrato: 1, createdAt: 1 }),
  ]);

  const contratoIds = contratos.map((contrato) => contrato._id);
  const bmFilter = contratoIds.length
    ? { contratoId: { $in: contratoIds } }
    : null;

  if (bmFilter && ano) {
    bmFilter.ano = ano;
  }

  const bms = bmFilter
    ? await ResumoContratoBm.find(bmFilter).sort({
        ano: 1,
        mes: 1,
        createdAt: 1,
      })
    : [];

  const bmsByContratoId = new Map();
  const bmTotalsByContratoId = new Map();

  bms.forEach((bm) => {
    const contratoId = String(bm.contratoId);

    if (!bmsByContratoId.has(contratoId)) {
      bmsByContratoId.set(contratoId, []);
    }

    bmsByContratoId.get(contratoId).push(bm);
    bmTotalsByContratoId.set(
      contratoId,
      (bmTotalsByContratoId.get(contratoId) || 0) + getSafeNumber(bm.valorBm),
    );
  });

  const contratosByClienteId = new Map();

  contratos.forEach((contrato) => {
    const clienteKey = getContractClienteIdKey(contrato);

    if (!contratosByClienteId.has(clienteKey)) {
      contratosByClienteId.set(clienteKey, []);
    }

    contratosByClienteId.get(clienteKey).push(contrato);
  });

  const rows = [];

  clientes.forEach((cliente) => {
    const clienteKey = String(cliente._id);
    const contratosDoCliente = contratosByClienteId.get(clienteKey) || [];

    if (!contratosDoCliente.length) {
      rows.push(createClienteOnlyExportRow(cliente));
      return;
    }

    contratosDoCliente.forEach((contrato) => {
      appendContratoExportRows({
        rows,
        contrato,
        clienteName: cliente.nome,
        bmsByContratoId,
        bmTotalsByContratoId,
        ano,
      });
    });
  });

  const unassignedContracts =
    contratosByClienteId.get(UNASSIGNED_CLIENT_ID) || [];

  unassignedContracts.forEach((contrato) => {
    appendContratoExportRows({
      rows,
      contrato,
      clienteName: "Sem cliente definido",
      bmsByContratoId,
      bmTotalsByContratoId,
      ano,
    });
  });

  return rows;
};

const validateBmsPorMes = (bmsPorMes) => {
  if (!bmsPorMes || typeof bmsPorMes !== "object" || Array.isArray(bmsPorMes)) {
    return {
      ok: false,
      status: 422,
      msg: "bmsPorMes e obrigatorio.",
    };
  }

  const invalidMonth = Object.keys(bmsPorMes).find((monthKey) => {
    const month = Number(monthKey);
    return (
      !/^\d+$/.test(monthKey) ||
      !Number.isInteger(month) ||
      month < 1 ||
      month > 12
    );
  });

  if (invalidMonth) {
    return {
      ok: false,
      status: 422,
      msg: `Mes invalido informado: ${invalidMonth}.`,
    };
  }

  const parsedBmsPorMes = {};

  for (const mes of MONTHS) {
    const monthKey = String(mes);
    const value = hasOwn(bmsPorMes, monthKey) ? bmsPorMes[monthKey] : 0;
    const result = parseNumber(value, `Valor do BM do mes ${mes}`, 0);

    if (!result.ok) {
      return result;
    }

    parsedBmsPorMes[mes] = result.value;
  }

  return {
    ok: true,
    bmsPorMes: parsedBmsPorMes,
  };
};

const listResumoContratos = async (req, res) => {
  const yearResult = parseYear(req.query?.ano);

  if (!yearResult.ok) {
    return res.status(yearResult.status || 422).json({ msg: yearResult.msg });
  }

  const ano = yearResult.value;

  try {
    const [clientes, contratos] = await Promise.all([
      Cliente.find().sort({ nome: 1 }),
      ResumoContrato.find()
        .populate({ path: "clienteId", select: "nome" })
        .sort({ updatedAt: -1 }),
    ]);
    const bmTotalsByContract = await getBmTotalsByContract(
      contratos.map((contrato) => contrato._id),
      ano,
    );

    const contratosResponse = contratos.map((contrato) =>
      mapContratoResumoResponse(
        contrato,
        bmTotalsByContract.get(String(contrato._id)) || 0,
      ),
    );
    const totalContratosByCliente = new Map();
    let totalContratosSemCliente = 0;

    contratosResponse.forEach((contrato) => {
      if (!contrato.clienteId) {
        totalContratosSemCliente += 1;
        return;
      }

      totalContratosByCliente.set(
        contrato.clienteId,
        (totalContratosByCliente.get(contrato.clienteId) || 0) + 1,
      );
    });

    const clientesResponse = clientes.map((cliente) => ({
      id: String(cliente._id),
      _id: cliente._id,
      nome: cliente.nome,
      totalContratos: totalContratosByCliente.get(String(cliente._id)) || 0,
      createdAt: cliente.createdAt,
      updatedAt: cliente.updatedAt,
    }));

    if (totalContratosSemCliente > 0) {
      clientesResponse.push({
        id: UNASSIGNED_CLIENT_ID,
        _id: null,
        nome: "Sem cliente definido",
        totalContratos: totalContratosSemCliente,
        isUnassigned: true,
      });
    }

    const orcamentoTotal = contratosResponse.reduce(
      (total, contrato) => total + contrato.orcamento,
      0,
    );
    const bmTotal = contratosResponse.reduce(
      (total, contrato) => total + contrato.bm,
      0,
    );

    return res.status(200).json({
      ano,
      totalClientes: clientes.length,
      clientes: clientesResponse,
      cards: getCards(orcamentoTotal, bmTotal),
      contratos: contratosResponse,
    });
  } catch (error) {
    console.log("listResumoContratos error", error);
    return res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

const exportResumoContratosMacro = async (req, res) => {
  const yearResult = parseOptionalYear(req.query?.ano);

  if (!yearResult.ok) {
    return res.status(yearResult.status || 422).json({ msg: yearResult.msg });
  }

  const clienteResult = parseExportClienteId(req.query?.clienteId);

  if (!clienteResult.ok) {
    return res
      .status(clienteResult.status || 422)
      .json({ msg: clienteResult.msg });
  }

  try {
    if (clienteResult.value && !clienteResult.isUnassigned) {
      const clienteExistsResult = await validateClienteExists(clienteResult.value);

      if (!clienteExistsResult.ok) {
        return res
          .status(clienteExistsResult.status)
          .json({ msg: clienteExistsResult.msg });
      }
    }

    const rows = await getResumoContratosExportRows({
      clienteId: clienteResult.value,
      isUnassigned: clienteResult.isUnassigned,
      ano: yearResult.value,
    });

    return res.status(200).json({
      filters: {
        ano: yearResult.value,
        clienteId: clienteResult.value,
        isUnassigned: clienteResult.isUnassigned,
      },
      totalRows: rows.length,
      rows,
    });
  } catch (error) {
    console.log("exportResumoContratosMacro error", error);
    return res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

const createResumoContrato = async (req, res) => {
  const payloadResult = getContratoPayload(req.body, {
    partial: false,
    requireCliente: true,
  });

  if (!payloadResult.ok) {
    return res
      .status(payloadResult.status || 422)
      .json({ msg: payloadResult.msg });
  }

  try {
    const clienteResult = await validateClienteExists(
      payloadResult.payload.clienteId,
    );

    if (!clienteResult.ok) {
      return res.status(clienteResult.status).json({ msg: clienteResult.msg });
    }

    const contrato = new ResumoContrato(payloadResult.payload);
    await contrato.save();
    await contrato.populate({ path: "clienteId", select: "nome" });

    return res.status(201).json({
      msg: "Resumo de contrato criado com sucesso.",
      contrato: mapContratoResponse(contrato),
    });
  } catch (error) {
    console.log("createResumoContrato error", error);
    return res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

const listResumoContratoById = async (req, res) => {
  const yearResult = parseYear(req.query?.ano);

  if (!yearResult.ok) {
    return res.status(yearResult.status || 422).json({ msg: yearResult.msg });
  }

  try {
    const findResult = await findResumoContratoById(req.params.id);

    if (!findResult.ok) {
      return res.status(findResult.status).json({ msg: findResult.msg });
    }

    const response = await getContratoDetailResponse(
      findResult.contrato,
      yearResult.value,
    );

    return res.status(200).json(response);
  } catch (error) {
    console.log("listResumoContratoById error", error);
    return res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

const editResumoContrato = async (req, res) => {
  const payloadResult = getContratoPayload(req.body, { partial: true });

  if (!payloadResult.ok) {
    return res
      .status(payloadResult.status || 422)
      .json({ msg: payloadResult.msg });
  }

  try {
    const findResult = await findResumoContratoById(req.params.id);

    if (!findResult.ok) {
      return res.status(findResult.status).json({ msg: findResult.msg });
    }

    if (hasOwn(payloadResult.payload, "clienteId")) {
      const clienteResult = await validateClienteExists(
        payloadResult.payload.clienteId,
      );

      if (!clienteResult.ok) {
        return res.status(clienteResult.status).json({ msg: clienteResult.msg });
      }
    }

    Object.assign(findResult.contrato, payloadResult.payload);
    await findResult.contrato.save();
    await findResult.contrato.populate({ path: "clienteId", select: "nome" });

    return res.status(200).json({
      msg: "Resumo de contrato atualizado com sucesso.",
      contrato: mapContratoResponse(findResult.contrato),
    });
  } catch (error) {
    console.log("editResumoContrato error", error);
    return res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

const deleteResumoContrato = async (req, res) => {
  try {
    const findResult = await findResumoContratoById(req.params.id);

    if (!findResult.ok) {
      return res.status(findResult.status).json({ msg: findResult.msg });
    }

    await ResumoContratoBm.deleteMany({ contratoId: findResult.contrato._id });
    await ResumoContrato.findByIdAndDelete(findResult.contrato._id);

    return res.status(200).json({
      msg: "Resumo de contrato removido com sucesso.",
    });
  } catch (error) {
    console.log("deleteResumoContrato error", error);
    return res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

const findResumoContratoBmById = async (contratoId, bmId) => {
  if (!mongoose.Types.ObjectId.isValid(bmId)) {
    return {
      ok: false,
      status: 422,
      msg: "BM invalido.",
    };
  }

  const bm = await ResumoContratoBm.findOne({
    _id: bmId,
    contratoId,
  });

  if (!bm) {
    return {
      ok: false,
      status: 404,
      msg: "BM nao encontrado.",
    };
  }

  return {
    ok: true,
    bm,
  };
};

const createResumoContratoBm = async (req, res) => {
  const payloadResult = getBmPayload(req.body, { partial: false });

  if (!payloadResult.ok) {
    return res
      .status(payloadResult.status || 422)
      .json({ msg: payloadResult.msg });
  }

  try {
    const findResult = await findResumoContratoById(req.params.id);

    if (!findResult.ok) {
      return res.status(findResult.status).json({ msg: findResult.msg });
    }

    const bm = new ResumoContratoBm({
      contratoId: findResult.contrato._id,
      ...payloadResult.payload,
    });
    await bm.save();

    const response = await getContratoDetailResponse(
      findResult.contrato,
      payloadResult.payload.ano,
    );

    return res.status(201).json(response);
  } catch (error) {
    console.log("createResumoContratoBm error", error);
    return res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

const editResumoContratoBm = async (req, res) => {
  const payloadResult = getBmPayload(req.body, { partial: true });

  if (!payloadResult.ok) {
    return res
      .status(payloadResult.status || 422)
      .json({ msg: payloadResult.msg });
  }

  try {
    const findResult = await findResumoContratoById(req.params.id);

    if (!findResult.ok) {
      return res.status(findResult.status).json({ msg: findResult.msg });
    }

    const bmResult = await findResumoContratoBmById(
      findResult.contrato._id,
      req.params.bmId,
    );

    if (!bmResult.ok) {
      return res.status(bmResult.status).json({ msg: bmResult.msg });
    }

    Object.assign(bmResult.bm, payloadResult.payload);
    await bmResult.bm.save();

    const response = await getContratoDetailResponse(
      findResult.contrato,
      bmResult.bm.ano,
    );

    return res.status(200).json(response);
  } catch (error) {
    console.log("editResumoContratoBm error", error);
    return res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

const deleteResumoContratoBm = async (req, res) => {
  try {
    const findResult = await findResumoContratoById(req.params.id);

    if (!findResult.ok) {
      return res.status(findResult.status).json({ msg: findResult.msg });
    }

    const bmResult = await findResumoContratoBmById(
      findResult.contrato._id,
      req.params.bmId,
    );

    if (!bmResult.ok) {
      return res.status(bmResult.status).json({ msg: bmResult.msg });
    }

    const ano = bmResult.bm.ano;
    await ResumoContratoBm.findByIdAndDelete(bmResult.bm._id);

    const response = await getContratoDetailResponse(findResult.contrato, ano);

    return res.status(200).json(response);
  } catch (error) {
    console.log("deleteResumoContratoBm error", error);
    return res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

const manageResumoContratoBms = async (req, res) => {
  const yearResult = parseYear(req.body?.ano);

  if (!yearResult.ok) {
    return res.status(yearResult.status || 422).json({ msg: yearResult.msg });
  }

  const bmsResult = validateBmsPorMes(req.body?.bmsPorMes);

  if (!bmsResult.ok) {
    return res.status(bmsResult.status || 422).json({ msg: bmsResult.msg });
  }

  try {
    const findResult = await findResumoContratoById(req.params.id);

    if (!findResult.ok) {
      return res.status(findResult.status).json({ msg: findResult.msg });
    }

    const ano = yearResult.value;

    for (const mes of MONTHS) {
      const valorBm = bmsResult.bmsPorMes[mes];
      const filter = {
        contratoId: findResult.contrato._id,
        ano,
        mes,
      };

      if (valorBm > 0) {
        await ResumoContratoBm.findOneAndUpdate(
          filter,
          { valorBm },
          {
            new: true,
            runValidators: true,
            setDefaultsOnInsert: true,
            upsert: true,
          },
        );
      } else {
        await ResumoContratoBm.deleteOne(filter);
      }
    }

    const response = await getContratoDetailResponse(findResult.contrato, ano);

    return res.status(200).json(response);
  } catch (error) {
    console.log("manageResumoContratoBms error", error);

    if (error?.code === 11000) {
      return res.status(409).json({
        msg: "Ja existe BM para este contrato, ano e mes.",
      });
    }

    return res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

module.exports = {
  listResumoContratos,
  exportResumoContratosMacro,
  createResumoContrato,
  listResumoContratoById,
  editResumoContrato,
  deleteResumoContrato,
  createResumoContratoBm,
  editResumoContratoBm,
  deleteResumoContratoBm,
  manageResumoContratoBms,
};
