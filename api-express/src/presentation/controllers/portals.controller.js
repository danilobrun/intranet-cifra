// Models
const Portal = require("../../../models/Portal");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const listPortals = async (req, res) => {
  // const portals = await Portal.find();
  // return res.status(200).json(portals);
  try {
    if (req.user_type === 1) {
      const portal_ = await Portal.find().sort({ updatedAt: -1 });
      return res.status(200).json(portal_);
    }
    const portals = await Portal.find({
      name: {
        $nin: [
          "BI - Centro de custo (CIFRA)",
          "Omie",
          "BI - GERENTES (CAERN) 👨‍💼️",
          "BI - Infraestrutura TI 🖥️",
          "BI - RH (CIFRA) 👥",
        ],
      },
    }).sort({ updatedAt: -1 });
    console.log("type do user", req.user_type);
    return res.status(200).json(portals);
  } catch (err) {
    console.log(err);
    return res.status(500).send("erro no portal");
  }
};

// List portals by Id
const listPortalsById = async (req, res) => {
  const id = req.params.id;

  // Check if portal exists
  // const portal = await Portal.findById(id);

  const portal = await Portal.aggregate([
    {
      $addFields: {
        _idPortalString: {
          $toString: "$_id",
        },
      },
    },
    {
      $lookup: {
        from: "inscriptions",
        localField: "_idPortalString",
        foreignField: "portalId",
        as: "inscriptions",
      },
    },
    {
      $match: {
        _id: new mongoose.Types.ObjectId(id),
      },
    },
  ]);

  // Validations
  if (!portal[0]) {
    return res.status(422).json({ msg: `Portal de id: ${id} não localizado!` });
  }
  return res.status(200).json(portal[0]);
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
    return res.status(200).json({
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

// Update portal

const editPortal = async (req, res) => {
  const { id } = req.params;
  const { name, responsible, description, shortDescription, image, url } =
    req.body;
  console.log(`log do id da req: ${id}`);

  const portalData = {
    id,
    name,
    responsible,
    description,
    shortDescription,
    image,
    url,
    updatedAt: new Date(),
  };

  // check if portal exists
  const portalExists = await Portal.findById({ _id: id });

  if (!portalExists) {
    return res.status(422).json({
      msg: `portal de id:${id} não existe, favor informar um novo portal!`,
    });
  }

  // update portal
  try {
    const result = await Portal.findByIdAndUpdate(portalData.id, {
      name,
      responsible,
      description,
      shortDescription,
      image,
      url,
      updatedAt: new Date(),
    });

    const listPortalUpdated = await Portal.findById(portalData.id);
    console.log(listPortalUpdated);
    return res.status(200).json({
      msg: `
          Portal atualizado com sucesso!
          Antigo:
          ${result}
          
          Atual:
          ${listPortalUpdated}
      `,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

module.exports = {
  listPortals,
  createPortal,
  listPortalsById,
  deletePortalsById,
  editPortal,
};
