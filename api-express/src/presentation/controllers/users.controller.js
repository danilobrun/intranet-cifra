// Models
const User = require("../../../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

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
  const { name, email, password, type } = req.body;

  // Validations
  if (!name) {
    return res.status(422).json({ msg: "O nome é obrigatório" });
  }

  if (!email) {
    return res.status(422).json({ msg: "O email é obrigatório" });
  }

  if (!password) {
    return res.status(422).json({ msg: "A senha é obrigatória" });
  }

  if (type !== 1 && type !== 2) {
    return res.status(422).json({ msg: "Favor informar tipo 1 ou 2" });
  }

  // check if user exists
  const userExists = await User.findOne({ email: email });

  if (userExists) {
    return res.status(422).json({ msg: "Por favor, utilize outro e-mail." });
  }

  // create password
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  // create user
  const user = new User({
    name,
    email,
    password: passwordHash,
    type,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  try {
    var userMongo = await user.save();
    const secret = process.env.SECRET;
    const token = jwt.sign(
      {
        id: userMongo._id,
      },
      secret,
      {
        expiresIn: "2h", // token expira em 2 horas
      }
    );

    res.status(201).json({
      msg: "Usuário criado com sucesso",
      user: {
        name: name,
        email: email,
        type: Number(type),
        _id: userMongo._id,
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
  const user = await User.findOne({ email: email });

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
        expiresIn: "2h", // token expira em 2 horas
      }
    );

    return res.status(200).json({
      msg: "Autenticação realizada com sucesso!",
      token,
      user: {
        name: user.name,
        email: user.email,
        type: Number(user.type),
        _id: user._id,
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
  const { name, email } = req.body;

  const userData = {
    id,
    name,
    email,
  };

  console.log(userData);

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
    const result = await User.findByIdAndUpdate(
      userData.id,
      {
        name,
        email,
      }
      // function (err, docs) {
      //     if (err) {
      //         console.log(err);
      //     }
      //     else {
      //         console.log("Updated User : ", docs);
      //     }
      // }
    );
    const userListUpdated = await User.findById(userData.id);
    console.log(userListUpdated);
    return res.status(200).send(`Usuário atualizado!
        Antigo:
        ${result}
        Atual:
        ${userListUpdated}`);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }

  // const result = await User.find()
  // return res.status(200).json(result)
};

module.exports = {
  listUsers,
  getUserById,
  createUser,
  loginUser,
  deleteUser,
  editUser,
};
