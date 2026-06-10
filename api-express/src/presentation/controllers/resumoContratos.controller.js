const mongoose = require("mongoose");
const ResumoContrato = require("../../../models/ResumoContrato");
const ResumoContratoBm = require("../../../models/ResumoContratoBm");

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

const hasOwn = (object, key) =>
  Object.prototype.hasOwnProperty.call(object || {}, key);

const getCurrentYear = () => new Date().getFullYear();

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

const getContratoPayload = (body = {}, options = {}) => {
  const payload = {};
  const shouldReadField = (fieldName) =>
    !options.partial || hasOwn(body, fieldName);

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

const mapContratoResponse = (contrato) => ({
  id: String(contrato._id),
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

  const contrato = await ResumoContrato.findById(id);

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

const getBmsPorMes = async (contratoId, ano) => {
  const bms = await ResumoContratoBm.find({ contratoId, ano }).sort({ mes: 1 });
  const bmsPorMes = MONTHS.reduce((acc, mes) => {
    acc[String(mes)] = 0;
    return acc;
  }, {});

  bms.forEach((bm) => {
    bmsPorMes[String(bm.mes)] = getSafeNumber(bm.valorBm);
  });

  return bmsPorMes;
};

const getContratoDetailResponse = async (contrato, ano) => {
  const bmsPorMes = await getBmsPorMes(contrato._id, ano);
  const bm = Object.values(bmsPorMes).reduce(
    (total, valorBm) => total + getSafeNumber(valorBm),
    0,
  );
  const orcamento = getSafeNumber(contrato.orcamento);

  return {
    ano,
    contrato: {
      id: String(contrato._id),
      nomeContrato: contrato.nomeContrato ?? "",
      orcamento,
      dataInicio: contrato.dataInicio || null,
      dataFim: contrato.dataFim || null,
      bm,
      saldo: orcamento - bm,
      gap: getGap(contrato.dataFim),
    },
    cards: getCards(orcamento, bm),
    bmsPorMes,
  };
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
    const contratos = await ResumoContrato.find().sort({ updatedAt: -1 });
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

const createResumoContrato = async (req, res) => {
  const payloadResult = getContratoPayload(req.body, { partial: false });

  if (!payloadResult.ok) {
    return res
      .status(payloadResult.status || 422)
      .json({ msg: payloadResult.msg });
  }

  try {
    const contrato = new ResumoContrato(payloadResult.payload);
    await contrato.save();

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

    Object.assign(findResult.contrato, payloadResult.payload);
    await findResult.contrato.save();

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
  createResumoContrato,
  listResumoContratoById,
  editResumoContrato,
  deleteResumoContrato,
  manageResumoContratoBms,
};
