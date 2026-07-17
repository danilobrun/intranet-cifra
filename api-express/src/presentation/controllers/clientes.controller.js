const mongoose = require("mongoose");
const Cliente = require("../../../models/Cliente");
const ResumoContrato = require("../../../models/ResumoContrato");
const ResumoContratoBm = require("../../../models/ResumoContratoBm");

const ACTIVE_FILTER = { active: { $ne: false } };

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
  active: cliente.active !== false,
  totalContratos,
  createdAt: cliente.createdAt,
  updatedAt: cliente.updatedAt,
});

const findClienteById = async (id, { activeOnly = true } = {}) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return {
      ok: false,
      status: 422,
      msg: "Cliente invalido.",
    };
  }

  const filter = { _id: id };

  if (activeOnly) {
    Object.assign(filter, ACTIVE_FILTER);
  }

  const cliente = await Cliente.findOne(filter);

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
    ...ACTIVE_FILTER,
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
        ...ACTIVE_FILTER,
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
    const clientes = await Cliente.find(ACTIVE_FILTER).sort({ nome: 1 });
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
      ...ACTIVE_FILTER,
    }).select("_id");
    const contratoIds = contratos.map((contrato) => contrato._id);
    const deletedBms = contratoIds.length
      ? await ResumoContratoBm.countDocuments({
          contratoId: { $in: contratoIds },
        })
      : 0;

    findResult.cliente.active = false;
    await findResult.cliente.save();

    return res.status(200).json({
      msg: "Cliente removido com sucesso.",
      deletedContracts: contratos.length,
      deletedBms,
    });
  } catch (error) {
    console.log("deleteCliente error", error);
    return res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

const listInactiveClientes = async (req, res) => {
  try {
    const clientes = await Cliente.find({ active: false }).sort({ nome: 1 });
    const clienteIds = clientes.map((cliente) => cliente._id);
    const totals = clienteIds.length
      ? await ResumoContrato.aggregate([
          {
            $match: {
              clienteId: { $in: clienteIds },
            },
          },
          {
            $group: {
              _id: "$clienteId",
              total: { $sum: 1 },
            },
          },
        ])
      : [];
    const totalsByCliente = new Map(
      totals.map((item) => [String(item._id), item.total]),
    );

    return res.status(200).json(
      clientes.map((cliente) =>
        mapClienteResponse(
          cliente,
          totalsByCliente.get(String(cliente._id)) || 0,
        ),
      ),
    );
  } catch (error) {
    console.log("listInactiveClientes error", error);
    return res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

const reactivateCliente = async (req, res) => {
  try {
    const findResult = await findClienteById(req.params.id, {
      activeOnly: false,
    });

    if (!findResult.ok) {
      return res.status(findResult.status).json({ msg: findResult.msg });
    }

    if (findResult.cliente.active !== false) {
      return res.status(409).json({ msg: "Cliente ja esta ativo." });
    }

    const duplicatedCliente = await findDuplicateCliente(
      findResult.cliente.nome,
      findResult.cliente._id,
    );

    if (duplicatedCliente) {
      return res.status(409).json({
        msg: "Ja existe um cliente ativo com este nome.",
      });
    }

    findResult.cliente.active = true;
    await findResult.cliente.save();

    const totalContratos = await ResumoContrato.countDocuments({
      clienteId: findResult.cliente._id,
      ...ACTIVE_FILTER,
    });

    return res.status(200).json({
      msg: "Cliente reativado com sucesso.",
      cliente: mapClienteResponse(findResult.cliente, totalContratos),
    });
  } catch (error) {
    console.log("reactivateCliente error", error);
    return res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

module.exports = {
  listClientes,
  listInactiveClientes,
  createCliente,
  editCliente,
  deleteCliente,
  reactivateCliente,
};
