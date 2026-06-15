const mongoose = require("mongoose");
const Cliente = require("../../../models/Cliente");
const ResumoContrato = require("../../../models/ResumoContrato");
const ResumoContratoBm = require("../../../models/ResumoContratoBm");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getText = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value !== "string") {
    return null;
  }

  return value.trim();
};

const getClientePayload = (body = {}) => {
  const nome = getText(body.nome);

  if (nome === null) {
    return {
      ok: false,
      status: 422,
      msg: "Nome do cliente precisa ser texto.",
    };
  }

  if (!nome) {
    return {
      ok: false,
      status: 422,
      msg: "Nome do cliente e obrigatorio.",
    };
  }

  return {
    ok: true,
    payload: {
      nome,
    },
  };
};

const mapClienteResponse = (cliente, totalContratos = 0) => ({
  id: String(cliente._id),
  _id: cliente._id,
  nome: cliente.nome,
  totalContratos,
  createdAt: cliente.createdAt,
  updatedAt: cliente.updatedAt,
});

const findClienteById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return {
      ok: false,
      status: 422,
      msg: "Cliente invalido.",
    };
  }

  const cliente = await Cliente.findById(id);

  if (!cliente) {
    return {
      ok: false,
      status: 404,
      msg: "Cliente nao encontrado.",
    };
  }

  return {
    ok: true,
    cliente,
  };
};

const findDuplicateCliente = async (nome, ignoredId) => {
  const filter = {
    nome: new RegExp(`^${escapeRegex(nome)}$`, "i"),
  };

  if (ignoredId) {
    filter._id = { $ne: ignoredId };
  }

  return Cliente.findOne(filter);
};

const getContractTotalsByCliente = async () => {
  const totals = await ResumoContrato.aggregate([
    {
      $match: {
        clienteId: { $ne: null },
      },
    },
    {
      $group: {
        _id: "$clienteId",
        total: { $sum: 1 },
      },
    },
  ]);

  return new Map(totals.map((item) => [String(item._id), item.total]));
};

const listClientes = async (req, res) => {
  try {
    const clientes = await Cliente.find().sort({ nome: 1 });
    const totalsByCliente = await getContractTotalsByCliente();

    return res.status(200).json(
      clientes.map((cliente) =>
        mapClienteResponse(cliente, totalsByCliente.get(String(cliente._id)) || 0),
      ),
    );
  } catch (error) {
    console.log("listClientes error", error);
    return res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

const createCliente = async (req, res) => {
  const payloadResult = getClientePayload(req.body);

  if (!payloadResult.ok) {
    return res
      .status(payloadResult.status || 422)
      .json({ msg: payloadResult.msg });
  }

  try {
    const duplicatedCliente = await findDuplicateCliente(
      payloadResult.payload.nome,
    );

    if (duplicatedCliente) {
      return res.status(409).json({ msg: "Cliente ja cadastrado." });
    }

    const cliente = new Cliente(payloadResult.payload);
    await cliente.save();

    return res.status(201).json({
      msg: "Cliente criado com sucesso.",
      cliente: mapClienteResponse(cliente),
    });
  } catch (error) {
    console.log("createCliente error", error);
    return res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

const editCliente = async (req, res) => {
  const payloadResult = getClientePayload(req.body);

  if (!payloadResult.ok) {
    return res
      .status(payloadResult.status || 422)
      .json({ msg: payloadResult.msg });
  }

  try {
    const findResult = await findClienteById(req.params.id);

    if (!findResult.ok) {
      return res.status(findResult.status).json({ msg: findResult.msg });
    }

    const duplicatedCliente = await findDuplicateCliente(
      payloadResult.payload.nome,
      findResult.cliente._id,
    );

    if (duplicatedCliente) {
      return res.status(409).json({ msg: "Cliente ja cadastrado." });
    }

    findResult.cliente.nome = payloadResult.payload.nome;
    await findResult.cliente.save();

    return res.status(200).json({
      msg: "Cliente atualizado com sucesso.",
      cliente: mapClienteResponse(findResult.cliente),
    });
  } catch (error) {
    console.log("editCliente error", error);
    return res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

const deleteCliente = async (req, res) => {
  try {
    const findResult = await findClienteById(req.params.id);

    if (!findResult.ok) {
      return res.status(findResult.status).json({ msg: findResult.msg });
    }

    const contratos = await ResumoContrato.find({
      clienteId: findResult.cliente._id,
    }).select("_id");
    const contratoIds = contratos.map((contrato) => contrato._id);

    let deletedBms = 0;

    if (contratoIds.length) {
      const bmsResult = await ResumoContratoBm.deleteMany({
        contratoId: { $in: contratoIds },
      });
      deletedBms = bmsResult.deletedCount || 0;
    }

    const contratosResult = await ResumoContrato.deleteMany({
      clienteId: findResult.cliente._id,
    });

    await Cliente.findByIdAndDelete(findResult.cliente._id);

    return res.status(200).json({
      msg: "Cliente removido com sucesso.",
      deletedContracts: contratosResult.deletedCount || 0,
      deletedBms,
    });
  } catch (error) {
    console.log("deleteCliente error", error);
    return res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

module.exports = {
  listClientes,
  createCliente,
  editCliente,
  deleteCliente,
};
