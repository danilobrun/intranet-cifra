// Models
const Inscription = require("../../../models/Inscription");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// List inscription
const listInscriptions = async (req, res) => {
  const inscription = await Inscription.find();
  return res.status(200).json(inscription);
};

// List inscription by Id
const listinscriptionById = async (req, res) => {
  const { id } = req.params;

  // Check if portal exists
  const inscription = await Inscription.findById({ _id: id });

  // Validations
  if (!inscription) {
    return res
      .status(422)
      .json({ msg: `A inscrição de id: ${id} não localizado!` });
  }
  return res.status(200).json(inscription);
};

// Create inscription
const createInscription = async (req, res) => {
  const { name, email, portalId, userId } = req.body;

  // Validations
  if (!name) {
    return res.status(422).json({ msg: "O nome é obrigatório" });
  }

  if (!email) {
    return res.status(422).json({ msg: "O e-mail é obrigatório" });
  }

  if (!portalId) {
    return res.status(422).json({ msg: "O id do portal é obrigatório." });
  }
  if (!userId) {
    return res.status(422).json({ msg: "O userId do portal é obrigatório." });
  }

  // check if inscription exists
  const inscriptionExists = await Inscription.findOne({ portalId, userId });

  if (inscriptionExists) {
    return res.status(422).json({
      msg: `Inscrição: ${userId} já existe no portal ${portalId}, por favor cadastre outra inscrição!`,
    });
  }

  //Create portal
  const inscription = new Inscription({
    name,
    email,
    portalId,
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  //Save into database
  try {
    await inscription.save();
    return res.status(201).json({
      msg: `Inscrição: ${name} salvo no portal do usuário: ${userId} com sucesso`,
    });
  } catch (err) {
    console.log("Error", err);
    return res
      .status(500)
      .json({ msg: "Aconteceu algo no servidor, tente novamente mais tarde!" });
  }
};

// Delete inscription by Id
const deleteInscriptionsById = async (req, res) => {
  const { id } = req.params;

  // Check if inscriptions exists
  const inscriptions = await Inscription.findById({ _id: id });

  // Validations
  if (!inscriptions) {
    return res
      .status(422)
      .json({ msg: `Inscriptions de id: ${id} não localizado!` });
  }

  // delete inscriptions on database
  try {
    const deleteInscription = await Inscription.findOneAndDelete({ _id: id });
    return res.status(200).json({
      msg: `Inscrição: ${deleteInscription.name} de id: ${id} foi deletado com sucesso!`,
    });
  } catch (err) {
    console.log(`error: ${err}`);
    return res.status(500).json({ msg: `Portal de id: ${id} não localizado!` });
  }
};

module.exports = {
  listInscriptions,
  listinscriptionById,
  createInscription,
  deleteInscriptionsById,
};
