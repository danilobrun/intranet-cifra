// Models
const User = require("../../../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Role = require("../../../models/Role");

const listUsers = async (req, res) => {
  const users = await User.find();

  res.status(200).json(users);
};
// Private Route - Only Logged Users
const getUserById = async (req, res) => {
  const id = req.params.id;

  // Check if user exists
  const user = await User.findById(id, "-password");

  if (!user) {
    res.status(404).json({ msg: "Usuário não encontrado!" });
  }

  res.status(200).json({ user });
};

// Register User
const createUser = async (req, res) => {
  const {
    name,
    email,
    password,
    number,
    personalNumber,
    function: jobFunction,
    state,
    lotation,
    roleCodes,
  } = req.body;

  // Validations
  if (!name) return res.status(422).json({ msg: "O nome é obrigatório" });
  if (!email) return res.status(422).json({ msg: "O email é obrigatório" });
  if (!password) return res.status(422).json({ msg: "A senha é obrigatória" });
  if (!number) return res.status(422).json({ msg: "O telefone é obrigatório" });
  if (!roleCodes || !Array.isArray(roleCodes) || roleCodes.length === 0) {
    return res.status(422).json({ msg: "As roles são obrigatórias" });
  }

  // check if user exists
  const userExists = await User.findOne({ email: email });
  if (userExists) {
    return res.status(422).json({ msg: "Por favor, utilize outro e-mail." });
  }

  const roles = await Role.find({ code: { $in: roleCodes } });
  if (!roles.length) return res.status(400).send("Roles inválidos");

  // create password
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  // create user
  const user = new User({
    name,
    email,
    password: passwordHash,
    number,
    personalNumber,
    function: jobFunction,
    state,
    lotation,
    roles: roles.map((r) => r._id),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  try {
    var userMongo = await user.save();
    const secret = process.env.SECRET;
    const token = jwt.sign(
      {
        id: userMongo._id,
        role: userMongo.roles,
      },
      secret,
      {
        expiresIn: "2h", // token expira (2h,2m,2s)
      }
    );

    res.status(201).json({
      msg: "Usuário criado com sucesso",
      user: {
        name: name,
        email: email,
        roles: roles.map((r) => ({
          code: r.code,
          cargo: r.cargo,
          empresa: r.empresa,
          contrato: r.contrato,
        })),
        _id: userMongo._id,
        number: number,
      },
      token: token,
    });
  } catch (error) {
    console.log("error", error);

    res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

// Login User - Route
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Validations
  if (!email) {
    return res.status(422).json({ msg: "O email é obrigatório" });
  }

  if (!password) {
    return res.status(422).json({ msg: "A senha é obrigatória" });
  }

  // Check if user exists
  const user = await User.findOne({ email: email }).populate("roles");

  if (!user) {
    return res.status(404).json({ msg: "Usuário não encontrado." });
  }

  // Check if password match
  const checkPassword = await bcrypt.compare(password, user.password);

  if (!checkPassword) {
    return res.status(422).json({ msg: "Senha inválida!" });
  }

  try {
    const secret = process.env.SECRET;
    const token = jwt.sign(
      {
        id: user._id,
      },
      secret,
      {
        expiresIn: "2h", // token expira em (2h,2m,2s)
      }
    );

    return res.status(200).json({
      msg: "Autenticação realizada com sucesso!",
      token,
      user: {
        name: user.name,
        email: user.email,
        _id: user._id,
        roles: user.roles.map((r) => ({
          code: r.code,
        })),
      },
    });
  } catch (err) {
    return res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

// delete user
const deleteUser = async (req, res) => {
  const { id } = req.params;

  console.log(req.params);

  // Validations
  if (!id) {
    return res.status(422).json({ msg: "Favor informar usuário." });
  }

  // Check if user exists
  const user = await User.findById({ _id: id });

  if (!user) {
    return res.status(404).json({ msg: "Usuário não encontrado!" });
  }

  try {
    // Delete user
    const removeUser = await User.findOneAndDelete({ _id: id });

    return res
      .status(200)
      .send({ msg: `usuário deletado foi ${id}, ${removeUser.name}` });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ msg: `Usuário ${id} não localizado!` });
  }
};

const editUser = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    email,
    number,
    personalNumber,
    function: jobFunction,
    state,
    lotation,
    roleCodes,
  } = req.body;

  // Validations
  if (!name) {
    return res.status(422).json({ msg: "O nome é obrigatório" });
  }

  if (!email) {
    return res.status(422).json({ msg: "O email é obrigatório" });
  }

  // check if user exists
  const userExists = await User.findOne({ _id: id });

  if (!userExists) {
    return res.status(422).json({ msg: "Usuário não encontrado!" });
  }

  try {
    const updateData = {
      name,
      email,
      number,
      personalNumber,
      function: jobFunction,
      state,
      lotation,
    };

    if (roleCodes && Array.isArray(roleCodes)) {
      const roles = await Role.find({ code: { $in: roleCodes } });
      if (!roles.length) {
        return res.status(400).json({ msg: "Roles inválidas." });
      }
      updateData.roles = roles.map((r) => r._id);
    }

    await User.findByIdAndUpdate(id, updateData);

    const userListUpdated = await User.findById(id);
    return res.status(200).json({
      msg: "Usuário atualizado!",
      user: {
        name: userListUpdated.name,
        email: userListUpdated.email,
        number: userListUpdated.number,
        personalNumber: userListUpdated.personalNumber,
        function: userListUpdated.function,
        state: userListUpdated.state,
        lotation: userListUpdated.lotation,
        _id: userListUpdated._id,
        roles: userListUpdated.role.map((r) => ({
          code: r.code,
          cargo: r.cargo,
          empresa: r.empresa,
          contrato: r.contrato,
        })),
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

module.exports = {
  listUsers,
  getUserById,
  createUser,
  loginUser,
  deleteUser,
  editUser,
};
