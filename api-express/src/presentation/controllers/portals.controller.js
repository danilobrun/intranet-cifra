// Models
const Portal = require("../../../models/Portal");
const Role = require("../../../models/Role");
const mongoose = require("mongoose");

const listPortals = async (req, res) => {
  try {
    const roleCodes = Array.isArray(req.user?.roles) ? req.user.roles : [];

    if (!roleCodes.length) {
      return res.status(200).json([]);
    }

    const roles = await Role.find({
      code: { $in: roleCodes },
    }).populate({
      path: "portals",
      select: "_id",
    });

    const portalIds = [
      ...new Set(
        roles.flatMap((role) =>
          Array.isArray(role.portals)
            ? role.portals.map((portal) => String(portal._id))
            : [],
        ),
      ),
    ];

    if (!portalIds.length) {
      return res.status(200).json([]);
    }

    const portals = await Portal.find({
      _id: { $in: portalIds },
    }).sort({ updatedAt: -1 });

    return res.status(200).json(portals);
  } catch (err) {
    console.log(err);
    return res.status(500).send("erro no portal");
  }
};

const listAllPortals = async (req, res) => {
  try {
    const portals = await Portal.find().sort({ updatedAt: -1 });
    return res.status(200).json(portals);
  } catch (err) {
    console.log(err);
    return res.status(500).send("erro no portal");
  }
};

// List portals by Id
const listPortalsById = async (req, res) => {
  const id = req.params.id;

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

  if (!portal[0]) {
    return res.status(422).json({ msg: `Portal de id: ${id} nao localizado!` });
  }

  return res.status(200).json(portal[0]);
};

// Delete portals by Id
const deletePortalsById = async (req, res) => {
  const { id } = req.params;

  const portal = await Portal.findById({ _id: id });

  if (!portal) {
    return res.status(422).json({ msg: `Portal de id: ${id} nao localizado!` });
  }

  try {
    const deletePortal = await Portal.findOneAndDelete({ _id: id });
    return res.status(200).json({
      msg: `Portal: ${deletePortal.name} de id: ${id} foi deletado com sucesso!`,
    });
  } catch (err) {
    console.log(`error: ${err}`);
    return res.status(500).json({ msg: `Portal de id: ${id} nao localizado!` });
  }
};

// Create portals
const createPortal = async (req, res) => {
  const {
    name,
    responsible,
    description,
    shortDescription,
    image,
    url,
    details,
  } = req.body;

  if (!name) {
    return res.status(422).json({ msg: "O nome e obrigatorio" });
  }

  if (!responsible) {
    return res.status(422).json({ msg: "O responsavel e obrigatorio" });
  }

  if (!description) {
    return res.status(422).json({ msg: "A descricao e obrigatoria" });
  }

  if (!shortDescription) {
    return res.status(422).json({ msg: "A descricao curta e obrigatoria" });
  }

  if (!image) {
    return res.status(422).json({ msg: "A imagem e obrigatoria" });
  }

  const portalExists = await Portal.findOne({ name });

  if (portalExists) {
    return res.status(422).json({
      msg: `Portal: ${name} ja existe, por favor cadastre outro portal!`,
    });
  }

  const portal = new Portal({
    name,
    responsible,
    description,
    shortDescription,
    image,
    url,
    details,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  try {
    await portal.save();
    return res.status(201).json({ msg: `Portal: ${name} salvo com sucesso` });
  } catch (err) {
    console.log("Error", err);
    return res.status(500).json({
      msg: "Aconteceu algo no servidor, tente novamente mais tarde!",
    });
  }
};

// Update portal
const editPortal = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    responsible,
    description,
    shortDescription,
    image,
    url,
    details,
  } = req.body;

  const portalData = {
    id,
    name,
    responsible,
    description,
    shortDescription,
    image,
    url,
    details,
    updatedAt: new Date(),
  };

  const portalExists = await Portal.findById({ _id: id });

  if (!portalExists) {
    return res.status(422).json({
      msg: `portal de id:${id} nao existe, favor informar um novo portal!`,
    });
  }

  try {
    const result = await Portal.findByIdAndUpdate(portalData.id, {
      name,
      responsible,
      description,
      shortDescription,
      image,
      url,
      details,
      updatedAt: new Date(),
    });

    const listPortalUpdated = await Portal.findById(portalData.id);
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
  listAllPortals,
  createPortal,
  listPortalsById,
  deletePortalsById,
  editPortal,
};
