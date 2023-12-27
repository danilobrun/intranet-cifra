// Models
const Update = require("../../../models/UpdateTime");

// List Update
const ListUpdates = async (req, res) => {
  const update = await Update.find();
  res.status(200).json({ msg: `list of updates systtens ${update}` });
};

// List Update by Id
const listUpdateById = async (req, res) => {
  const { id } = req.params;

  // Check if update exists
  const update = await Update.findById({ _id: id });

  if (!listUpdateById) {
    return res
      .status(422)
      .json({ msg: `O update de id: ${id} não localizado!` });
  }
  return res.status(200).json(update);
};

// Create update
const createUpdate = async (req, res) => {
  const { portalId, name, hh, mm, period, url } = req.body;

  // Validations
  if (!portalId) {
    return res.status(422).json({ msg: "O portal é obrigatório." });
  }

  if (!name) {
    return res.status(422).json({ msg: "O nome é obrigatório." });
  }

  if (!hh) {
    return res
      .status(422)
      .json({ msg: "Informe a hora que o sistema atualiza." });
  }

  if (!mm) {
    return res
      .status(422)
      .json({ msg: "Informe o minuto que o sistema atualiza." });
  }

  if (!period) {
    return res
      .status(422)
      .json({ msg: "Informe o periodo em formato AM ou PM" });
  }

  if (!url) {
    return res.status(422).json({ msg: "Informe a URL do sistema" });
  }

  // Check if update exists
  const updateExists = await Update.findOne({ portalId, name });
  if (updateExists) {
    return res.status(422).json({
      msg: `Update de nome: ${name} já existe para esse portal: ${portalId}`,
    });
  }

  //Create update
  const update = new Update({
    portalId,
    name,
    hh,
    mm,
    period,
    url,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  //Save into database
  try {
    await update.save();
    return res.status(201).json({
      msg: `Update: ${name} salvo para o portal: ${portalId} com sucesso!`,
    });
  } catch (err) {
    console.log("Error", err);
    return res
      .status(500)
      .json({ msg: `Aconteceu algo no servidor, tente novamente mais tarde!` });
  }
};

// Delate update by Id

// Exports
module.exports = { ListUpdates, createUpdate };
