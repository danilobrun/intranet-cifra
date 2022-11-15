// Models
const Portal = require("../../../models/Portal");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const listPortals = async (req, res) => {
  const portals = await Portal.find();
  return res.status(200).json(portals);
};

// List portals by Id
const listPortalsById = async (req, res) => {
  const id = req.params.id;

  // Check if portal exists
  const portal = await Portal.findById(id);

  // Validations
  if (!portal) {
    return res.status(422).json({ msg: `Portal de id: ${id} não localizado!` });
  }
  return res.status(200).json(portal);
};

// Delete portals by Id
const deletePortalsById = async (req, res) => {
  const { id } = req.params;

  // Check if portal exists
  const portal = await Portal.findById({ _id: id });

  // Validations
  if (!portal) {
    return res.status(422).json({ msg: `Portal de id: ${id} não localizado!` });
  }

  // delete Portal on database
  try {
    const deletePortal = await Portal.findOneAndDelete({ _id: id });
    return res
      .status(200)
      .json({
        msg: `Portal: ${deletePortal.name} de id: ${id} foi deletado com sucesso!`,
      });
  } catch (err) {
    console.log(`error: ${err}`);
    return res.status(500).json({ msg: `Portal de id: ${id} não localizado!` });
  }
};

// Create portals
const createPortal = async (req, res) => {
  const { name, responsible, description, shortDescription, image, url } =
    req.body;

  // Validations
  if (!name) {
    return res.status(422).json({ msg: "O nome é obrigatório" });
  }

  if (!responsible) {
    return res.status(422).json({ msg: "O responsável é obrigatório" });
  }

  if (!description) {
    return res.status(422).json({ msg: "A descrição é obrigatória" });
  }

  if (!shortDescription) {
    return res.status(422).json({ msg: "A descrição curta é obrigatória" });
  }

  if (!image) {
    return res.status(422).json({ msg: "A imagem é obrigatória" });
  }

  // check if portal exists
  const portalExists = await Portal.findOne({ name: name });

  if (portalExists) {
    return res.status(422).json({
      msg: `Portal: ${name} já existe, por favor cadastre outro portal!`,
    });
  }

  //Create portal
  const portal = new Portal({
    name,
    responsible,
    description,
    shortDescription,
    image,
    url,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  //Save into database
  try {
    await portal.save();
    return res.status(201).json({ msg: `Portal: ${name} salvo com sucesso` });
  } catch (err) {
    console.log("Error", err);
    return res
      .status(500)
      .json({ msg: "Aconteceu algo no servidor, tente novamente mais tarde!" });
  }
  // res.status(200).json({ msg: "rota de criar portal" });
};

module.exports = {
  listPortals,
  createPortal,
  listPortalsById,
  deletePortalsById,
};
