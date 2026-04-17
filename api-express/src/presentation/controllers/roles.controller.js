const mongoose = require("mongoose");
const Portal = require("../../../models/Portal");
const Role = require("../../../models/Role");
const User = require("../../../models/User");

const rolePopulateConfig = {
  path: "portals",
  select: "_id name shortDescription responsible updatedAt",
  options: { sort: { name: 1 } },
};

const mapPortalOption = (portal) => ({
  _id: portal._id,
  name: portal.name,
  shortDescription: portal.shortDescription,
  responsible: portal.responsible,
  updatedAt: portal.updatedAt,
});

const mapRoleResponse = (role) => ({
  _id: role._id,
  cargo: role.cargo,
  code: role.code,
  portals: Array.isArray(role.portals) ? role.portals.map(mapPortalOption) : [],
});

const normalizePortalIds = (value) => {
  if (!Array.isArray(value)) return [];

  return [...new Set(
    value
      .map((portal) => {
        if (portal && typeof portal === "object" && portal._id) {
          return String(portal._id).trim();
        }

        return String(portal || "").trim();
      })
      .filter(Boolean),
  )];
};

const getPortalIdsFromBody = (body = {}) => {
  if (Array.isArray(body.portalIds)) return normalizePortalIds(body.portalIds);
  if (Array.isArray(body.portals)) return normalizePortalIds(body.portals);

  return [];
};

const validatePortalIds = async (portalIds) => {
  const invalidPortalId = portalIds.find(
    (portalId) => !mongoose.Types.ObjectId.isValid(portalId),
  );

  if (invalidPortalId) {
    return {
      ok: false,
      msg: `Portal invalido informado: ${invalidPortalId}.`,
    };
  }

  const portals = await Portal.find(
    { _id: { $in: portalIds } },
    "_id name shortDescription responsible updatedAt",
  ).sort({ name: 1 });

  if (portals.length !== portalIds.length) {
    return {
      ok: false,
      msg: "Um ou mais portais informados nao existem.",
    };
  }

  return {
    ok: true,
    portals,
  };
};

const listRoles = async (req, res) => {
  try {
    const roles = await Role.find().populate(rolePopulateConfig).sort({
      cargo: 1,
      code: 1,
    });

    return res.status(200).json(roles.map(mapRoleResponse));
  } catch (error) {
    console.log("listRoles error", error);
    return res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

const listRoleById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(422).json({ msg: "Role invalida." });
  }

  try {
    const role = await Role.findById(id).populate(rolePopulateConfig);

    if (!role) {
      return res.status(404).json({ msg: "Role nao encontrada!" });
    }

    return res.status(200).json(mapRoleResponse(role));
  } catch (error) {
    console.log("listRoleById error", error);
    return res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

const listRolePortalOptions = async (req, res) => {
  try {
    const portals = await Portal.find(
      {},
      "_id name shortDescription responsible updatedAt",
    ).sort({ name: 1 });

    return res.status(200).json(portals.map(mapPortalOption));
  } catch (error) {
    console.log("listRolePortalOptions error", error);
    return res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

const createRole = async (req, res) => {
  const cargo = String(req.body?.cargo || "").trim();
  const code = String(req.body?.code || "").trim();
  const portalIds = getPortalIdsFromBody(req.body);

  if (!cargo) {
    return res.status(422).json({ msg: "O cargo e obrigatorio." });
  }

  if (!code) {
    return res.status(422).json({ msg: "O code e obrigatorio." });
  }

  try {
    const roleExists = await Role.findOne({ code });
    if (roleExists) {
      return res.status(422).json({ msg: "Ja existe uma role com esse code." });
    }

    const portalValidation = await validatePortalIds(portalIds);
    if (!portalValidation.ok) {
      return res.status(422).json({ msg: portalValidation.msg });
    }

    const role = new Role({
      cargo,
      code,
      portals: portalIds,
    });

    const savedRole = await role.save();
    await savedRole.populate(rolePopulateConfig);

    return res.status(201).json({
      msg: "Role criada com sucesso.",
      role: mapRoleResponse(savedRole),
    });
  } catch (error) {
    console.log("createRole error", error);
    return res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

const editRole = async (req, res) => {
  const { id } = req.params;
  const cargo = String(req.body?.cargo || "").trim();
  const code = String(req.body?.code || "").trim();
  const portalIds = getPortalIdsFromBody(req.body);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(422).json({ msg: "Role invalida." });
  }

  if (!cargo) {
    return res.status(422).json({ msg: "O cargo e obrigatorio." });
  }

  if (!code) {
    return res.status(422).json({ msg: "O code e obrigatorio." });
  }

  try {
    const roleExists = await Role.findById(id);
    if (!roleExists) {
      return res.status(404).json({ msg: "Role nao encontrada!" });
    }

    const duplicatedRole = await Role.findOne({
      _id: { $ne: id },
      code,
    });

    if (duplicatedRole) {
      return res.status(422).json({ msg: "Ja existe uma role com esse code." });
    }

    const portalValidation = await validatePortalIds(portalIds);
    if (!portalValidation.ok) {
      return res.status(422).json({ msg: portalValidation.msg });
    }

    await Role.findByIdAndUpdate(id, {
      cargo,
      code,
      portals: portalIds,
    });

    const updatedRole = await Role.findById(id).populate(rolePopulateConfig);

    return res.status(200).json({
      msg: "Role atualizada com sucesso.",
      role: mapRoleResponse(updatedRole),
    });
  } catch (error) {
    console.log("editRole error", error);
    return res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

const deleteRole = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(422).json({ msg: "Role invalida." });
  }

  try {
    const role = await Role.findById(id);

    if (!role) {
      return res.status(404).json({ msg: "Role nao encontrada!" });
    }

    const roleAssignedToUser = await User.exists({ roles: role._id });
    if (roleAssignedToUser) {
      return res.status(409).json({
        msg: "Nao e possivel remover uma role vinculada a usuarios.",
      });
    }

    await Role.findByIdAndDelete(id);

    return res.status(200).json({
      msg: `Role ${role.code} removida com sucesso.`,
    });
  } catch (error) {
    console.log("deleteRole error", error);
    return res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

module.exports = {
  listRoles,
  listRoleById,
  listRolePortalOptions,
  createRole,
  editRole,
  deleteRole,
};
