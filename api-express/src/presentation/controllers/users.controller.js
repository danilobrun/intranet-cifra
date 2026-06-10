// Models
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const User = require("../../../models/User");
const Role = require("../../../models/Role");
const { validateCpf } = require("../../helpers/cpf");
const {
  AvatarCryptoConfigError,
  AvatarCryptoDecryptError,
  decryptAvatarCpf,
  encryptAvatarCpf,
} = require("../../helpers/avatarCpfCrypto");
const {
  AvatarImageFetchError,
  findAvatarImageByCpf,
} = require("../../helpers/avatarImage");

const RECOVERY_CODE_EXPIRATION_MINUTES = 15;
const RECOVERY_CODE_RESEND_INTERVAL_MS = 60 * 1000;
const CIFRA_EMAIL_DOMAIN = "@cifraengenharia.com.br";
const USER_SAFE_SELECT =
  "-password -avatarCpfEncrypted -resetPasswordCodeHash -resetPasswordCodeExpiresAt -resetPasswordCodeSentAt";

const normalizeEmail = (email = "") => String(email).trim().toLowerCase();

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isCifraEmail = (email) =>
  normalizeEmail(email).endsWith(CIFRA_EMAIL_DOMAIN);

const escapeRegex = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const findUserByEmail = (email) => {
  const normalizedEmail = normalizeEmail(email);

  return User.findOne({
    email: { $regex: new RegExp(`^${escapeRegex(normalizedEmail)}$`, "i") },
  }).populate("roles");
};

const generateRecoveryCode = () =>
  String(crypto.randomInt(0, 1000000)).padStart(6, "0");

const hashRecoveryCode = (code) =>
  crypto.createHash("sha256").update(String(code)).digest("hex");

const parseBooleanEnv = (value) => String(value).toLowerCase() === "true";

const ensureSmtpConfig = () => {
  const requiredKeys = [
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_SECURE",
    "SMTP_USER",
    "SMTP_PASS",
    "SMTP_FROM_EMAIL",
    "SMTP_FROM_NAME",
  ];

  const missingKeys = requiredKeys.filter((key) => !process.env[key]);

  if (missingKeys.length) {
    throw new Error(
      `Missing SMTP environment variables: ${missingKeys.join(", ")}`,
    );
  }
};

const createMailTransporter = () => {
  ensureSmtpConfig();

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: parseBooleanEnv(process.env.SMTP_SECURE),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const buildPasswordResetEmail = (name, code) => {
  const safeName = name || "colaborador(a)";

  return {
    subject: "Código de recuperação de senha - Intranet Cifra",
    text: [
      `Olá, ${safeName}.`,
      "",
      "Recebemos uma solicitação para redefinir sua senha na Intranet Cifra.",
      `Seu código de recuperação e: ${code}`,
      `Esse código expira em ${RECOVERY_CODE_EXPIRATION_MINUTES} minutos.`,
      "",
      "Se você não fez essa solicitação, ignore este e-mail.",
    ].join("\n"),
    html: `
      <div style="background:#f4f7fb;padding:32px 16px;font-family:Arial,sans-serif;color:#1f2937;">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
          <div style="background:#ACAEAE;padding:24px 32px;color:#ffffff;">
            <h1 style="margin:0;font-size:24px;">Recuperação de senha</h1>
          </div>
          <div style="padding:32px;">
            <p style="margin:0 0 16px;font-size:16px;">Olá, ${safeName}.</p>
            <p style="margin:0 0 16px;line-height:1.6;">
              Recebemos uma solicitação para redefinir sua senha na Intranet Cifra.
              Use o código abaixo para continuar o processo:
            </p>
            <div style="margin:24px 0;padding:18px 24px;background:#f8fafc;border:1px dashed #0b5ed7;border-radius:12px;text-align:center;">
              <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#0b5ed7;">${code}</span>
            </div>
            <p style="margin:0 0 8px;line-height:1.6;">
              Esse código expira em ${RECOVERY_CODE_EXPIRATION_MINUTES} minutos e pode ser usado apenas uma vez.
            </p>
            <p style="margin:0;line-height:1.6;color:#6b7280;">
              Se você não fez essa solicitação, ignore este e-mail.
            </p>
          </div>
        </div>
      </div>
    `,
  };
};

const clearResetPasswordData = async (user) => {
  user.resetPasswordCodeHash = undefined;
  user.resetPasswordCodeExpiresAt = undefined;
  user.resetPasswordCodeSentAt = undefined;
  await user.save();
};

const validateRecoveryCodeOrThrow = async (user, code) => {
  if (
    !user ||
    !user.resetPasswordCodeHash ||
    !user.resetPasswordCodeExpiresAt ||
    !user.resetPasswordCodeSentAt
  ) {
    return {
      ok: false,
      msg: "Codigo de recuperacao invalido ou expirado.",
    };
  }

  if (user.resetPasswordCodeExpiresAt.getTime() < Date.now()) {
    await clearResetPasswordData(user);
    return {
      ok: false,
      msg: "Codigo de recuperacao invalido ou expirado.",
    };
  }

  if (hashRecoveryCode(code) !== user.resetPasswordCodeHash) {
    return {
      ok: false,
      msg: "Codigo de recuperacao invalido ou expirado.",
    };
  }

  return { ok: true };
};

const findUserForAvatarById = async (id) => {
  const userId = String(id || "").trim();

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return {
      ok: false,
      status: 422,
      msg: "Usuario invalido.",
    };
  }

  const user = await User.findById(userId).select("+avatarCpfEncrypted");

  if (!user) {
    return {
      ok: false,
      status: 404,
      msg: "Usuario nao encontrado!",
    };
  }

  return {
    ok: true,
    user,
  };
};

const getAvatarImageByCpf = async (cpf) => {
  const cpfValidation = validateCpf(cpf);

  if (!cpfValidation.ok) {
    return {
      ok: false,
      status: 422,
      msg: cpfValidation.msg,
    };
  }

  try {
    const avatarImage = await findAvatarImageByCpf(cpfValidation.cpf);

    if (!avatarImage) {
      return {
        ok: false,
        status: 404,
        msg: "Foto nao encontrada para o CPF informado.",
      };
    }

    return {
      ok: true,
      cpf: cpfValidation.cpf,
      avatarImage,
    };
  } catch (error) {
    if (error instanceof AvatarImageFetchError) {
      return {
        ok: false,
        status: 502,
        msg: "Nao foi possivel consultar a foto externa. Tente novamente mais tarde.",
      };
    }

    throw error;
  }
};

const sendAvatarImageResponse = (res, avatarImage) => {
  res.set("Content-Type", avatarImage.contentType);
  res.set("Content-Length", String(avatarImage.buffer.length));
  res.set(
    "Content-Disposition",
    `inline; filename="${avatarImage.fileName}"`,
  );
  res.set("Cache-Control", "private, no-store");

  return res.status(200).send(avatarImage.buffer);
};

const handleAvatarError = (error, res, context) => {
  if (error instanceof AvatarCryptoConfigError) {
    return res.status(500).json({
      msg: "Chave de criptografia do avatar nao configurada.",
    });
  }

  if (error instanceof AvatarCryptoDecryptError) {
    return res.status(500).json({
      msg: "Nao foi possivel ler a foto de perfil cadastrada.",
    });
  }

  console.log(`${context} error`, error?.message || error);

  return res.status(500).json({
    msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
  });
};

const previewAvatarFromCpf = async (req, res, context) => {
  try {
    const avatarResult = await getAvatarImageByCpf(req.body?.cpf);

    if (!avatarResult.ok) {
      return res.status(avatarResult.status).json({ msg: avatarResult.msg });
    }

    return sendAvatarImageResponse(res, avatarResult.avatarImage);
  } catch (error) {
    return handleAvatarError(error, res, context);
  }
};

const saveAvatarCpfForUser = async (userId, cpf) => {
  const userResult = await findUserForAvatarById(userId);

  if (!userResult.ok) {
    return userResult;
  }

  const avatarResult = await getAvatarImageByCpf(cpf);

  if (!avatarResult.ok) {
    return avatarResult;
  }

  userResult.user.avatarCpfEncrypted = encryptAvatarCpf(avatarResult.cpf);
  userResult.user.updatedAt = new Date();

  await userResult.user.save();

  return {
    ok: true,
  };
};

const getStoredAvatarImageForUser = async (userId) => {
  const userResult = await findUserForAvatarById(userId);

  if (!userResult.ok) {
    return userResult;
  }

  if (!userResult.user.avatarCpfEncrypted) {
    return {
      ok: false,
      status: 404,
      msg: "Foto de perfil nao cadastrada.",
    };
  }

  const cpf = decryptAvatarCpf(userResult.user.avatarCpfEncrypted);
  const avatarResult = await getAvatarImageByCpf(cpf);

  if (!avatarResult.ok && avatarResult.status === 422) {
    return {
      ok: false,
      status: 500,
      msg: "Foto de perfil cadastrada esta invalida.",
    };
  }

  if (!avatarResult.ok) {
    return {
      ok: false,
      status: avatarResult.status,
      msg: avatarResult.msg,
    };
  }

  return {
    ok: true,
    avatarImage: avatarResult.avatarImage,
  };
};

const previewMyAvatar = async (req, res) =>
  previewAvatarFromCpf(req, res, "previewMyAvatar");

const updateMyAvatar = async (req, res) => {
  try {
    const result = await saveAvatarCpfForUser(req.user?.id, req.body?.cpf);

    if (!result.ok) {
      return res.status(result.status).json({ msg: result.msg });
    }

    return res.status(200).json({
      msg: "Foto de perfil atualizada com sucesso.",
    });
  } catch (error) {
    return handleAvatarError(error, res, "updateMyAvatar");
  }
};

const getMyAvatar = async (req, res) => {
  try {
    const result = await getStoredAvatarImageForUser(req.user?.id);

    if (!result.ok) {
      return res.status(result.status).json({ msg: result.msg });
    }

    return sendAvatarImageResponse(res, result.avatarImage);
  } catch (error) {
    return handleAvatarError(error, res, "getMyAvatar");
  }
};

const previewUserAvatar = async (req, res) => {
  try {
    const userResult = await findUserForAvatarById(req.params.id);

    if (!userResult.ok) {
      return res.status(userResult.status).json({ msg: userResult.msg });
    }

    const avatarResult = await getAvatarImageByCpf(req.body?.cpf);

    if (!avatarResult.ok) {
      return res.status(avatarResult.status).json({ msg: avatarResult.msg });
    }

    return sendAvatarImageResponse(res, avatarResult.avatarImage);
  } catch (error) {
    return handleAvatarError(error, res, "previewUserAvatar");
  }
};

const updateUserAvatar = async (req, res) => {
  try {
    const result = await saveAvatarCpfForUser(req.params.id, req.body?.cpf);

    if (!result.ok) {
      return res.status(result.status).json({ msg: result.msg });
    }

    return res.status(200).json({
      msg: "Foto de perfil atualizada com sucesso.",
    });
  } catch (error) {
    return handleAvatarError(error, res, "updateUserAvatar");
  }
};

const getUserAvatar = async (req, res) => {
  try {
    const result = await getStoredAvatarImageForUser(req.params.id);

    if (!result.ok) {
      return res.status(result.status).json({ msg: result.msg });
    }

    return sendAvatarImageResponse(res, result.avatarImage);
  } catch (error) {
    return handleAvatarError(error, res, "getUserAvatar");
  }
};

const listUsers = async (req, res) => {
  const users = await User.find({}, USER_SAFE_SELECT).populate("roles");

  res.status(200).json(users);
};

// Private Route - Only Logged Users
const getUserById = async (req, res) => {
  const id = req.params.id;

  const user = await User.findById(id, USER_SAFE_SELECT).populate("roles");

  if (!user) {
    return res.status(404).json({ msg: "Usuario nao encontrado!" });
  }

  return res.status(200).json({ user });
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
    image,
    roleCodes,
  } = req.body;

  const normalizedEmail = normalizeEmail(email);

  if (!name) return res.status(422).json({ msg: "O nome e obrigatorio" });
  if (!normalizedEmail) {
    return res.status(422).json({ msg: "O email e obrigatorio" });
  }
  if (!password) return res.status(422).json({ msg: "A senha e obrigatoria" });
  if (!number) {
    return res.status(422).json({ msg: "O telefone e obrigatorio" });
  }
  if (!roleCodes || !Array.isArray(roleCodes) || roleCodes.length === 0) {
    return res.status(422).json({ msg: "As roles sao obrigatorias" });
  }

  const userExists = await findUserByEmail(normalizedEmail);
  if (userExists) {
    return res.status(422).json({ msg: "Por favor, utilize outro e-mail." });
  }

  const roles = await Role.find({ code: { $in: roleCodes } });
  if (!roles.length) return res.status(400).send("Roles invalidos");

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = new User({
    name,
    email: normalizedEmail,
    password: passwordHash,
    number,
    personalNumber,
    function: jobFunction,
    state,
    lotation,
    image,
    roles: roles.map((r) => r._id),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  try {
    const userMongo = await user.save();
    const secret = process.env.SECRET;
    const token = jwt.sign(
      {
        id: userMongo._id,
        role: userMongo.roles,
      },
      secret,
      {
        expiresIn: "2h",
      },
    );

    res.status(201).json({
      msg: "Usuario criado com sucesso",
      user: {
        name,
        email: normalizedEmail,
        roles: roles.map((r) => ({
          code: r.code,
          cargo: r.cargo,
          empresa: r.empresa,
          contrato: r.contrato,
        })),
        _id: userMongo._id,
        number,
      },
      token,
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
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return res.status(422).json({ msg: "O email e obrigatorio" });
  }

  if (!password) {
    return res.status(422).json({ msg: "A senha e obrigatoria" });
  }

  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    return res.status(404).json({ msg: "Usuario nao encontrado." });
  }

  const checkPassword = await bcrypt.compare(password, user.password);

  if (!checkPassword) {
    return res.status(422).json({ msg: "Senha invalida!" });
  }

  try {
    const secret = process.env.SECRET;
    const token = jwt.sign(
      {
        id: user._id,
      },
      secret,
      {
        expiresIn: "2h",
      },
    );

    return res.status(200).json({
      msg: "Autenticacao realizada com sucesso!",
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

const requestPasswordResetCode = async (req, res) => {
  const normalizedEmail = normalizeEmail(req.body?.email);

  if (!normalizedEmail) {
    return res.status(422).json({ msg: "O email e obrigatorio" });
  }

  if (!isValidEmail(normalizedEmail)) {
    return res.status(422).json({ msg: "Informe um email valido." });
  }

  if (!isCifraEmail(normalizedEmail)) {
    return res.status(422).json({
      msg: "O site so aceita e-mails com o dominio @cifraengenharia.com.br.",
    });
  }

  try {
    const user = await findUserByEmail(normalizedEmail);

    if (!user) {
      return res.status(200).json({
        msg: "Se o e-mail existir, enviaremos um codigo de recuperacao.",
      });
    }

    if (
      user.resetPasswordCodeSentAt &&
      Date.now() - user.resetPasswordCodeSentAt.getTime() <
        RECOVERY_CODE_RESEND_INTERVAL_MS
    ) {
      return res.status(429).json({
        msg: "Aguarde 60 segundos antes de solicitar um novo codigo.",
      });
    }

    const code = generateRecoveryCode();
    const transporter = createMailTransporter();
    const emailContent = buildPasswordResetEmail(user.name, code);

    user.resetPasswordCodeHash = hashRecoveryCode(code);
    user.resetPasswordCodeExpiresAt = new Date(
      Date.now() + RECOVERY_CODE_EXPIRATION_MINUTES * 60 * 1000,
    );
    user.resetPasswordCodeSentAt = new Date();

    await user.save();

    try {
      await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
        to: user.email,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
      });
    } catch (mailError) {
      await clearResetPasswordData(user);
      throw mailError;
    }

    return res.status(200).json({
      msg: "Se o e-mail existir, enviaremos um codigo de recuperacao.",
    });
  } catch (error) {
    console.log("requestPasswordResetCode error", error);
    return res.status(500).json({
      msg: "Falha ao enviar o codigo de recuperacao. Tente novamente.",
    });
  }
};

const verifyPasswordResetCode = async (req, res) => {
  const normalizedEmail = normalizeEmail(req.body?.email);
  const code = String(req.body?.code || "").trim();

  if (!normalizedEmail) {
    return res.status(422).json({ msg: "O email e obrigatorio" });
  }

  if (!code) {
    return res.status(422).json({ msg: "O codigo e obrigatorio" });
  }

  if (!/^\d{6}$/.test(code)) {
    return res
      .status(422)
      .json({ msg: "Informe um codigo valido com 6 digitos." });
  }

  try {
    const user = await findUserByEmail(normalizedEmail);
    const validation = await validateRecoveryCodeOrThrow(user, code);

    if (!validation.ok) {
      return res.status(400).json({ msg: validation.msg });
    }

    return res.status(200).json({ msg: "Codigo validado com sucesso." });
  } catch (error) {
    console.log("verifyPasswordResetCode error", error);
    return res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

const resetUserPassword = async (req, res) => {
  const normalizedEmail = normalizeEmail(req.body?.email);
  const code = String(req.body?.code || "").trim();
  const password = String(req.body?.password || "");
  const confirmPassword = String(req.body?.confirmPassword || "");

  if (!normalizedEmail) {
    return res.status(422).json({ msg: "O email e obrigatorio" });
  }

  if (!isValidEmail(normalizedEmail)) {
    return res.status(422).json({ msg: "Informe um email valido." });
  }

  if (!isCifraEmail(normalizedEmail)) {
    return res.status(422).json({
      msg: "O site so aceita e-mails com o dominio @cifraengenharia.com.br.",
    });
  }

  if (!code) {
    return res.status(422).json({ msg: "O codigo e obrigatorio" });
  }

  if (!/^\d{6}$/.test(code)) {
    return res
      .status(422)
      .json({ msg: "Informe um codigo valido com 6 digitos." });
  }

  if (!password) {
    return res.status(422).json({ msg: "A senha e obrigatoria" });
  }

  if (!confirmPassword) {
    return res
      .status(422)
      .json({ msg: "A confirmacao de senha e obrigatoria" });
  }

  if (password.length < 4) {
    return res
      .status(422)
      .json({ msg: "A senha deve ter no minimo 4 caracteres." });
  }

  if (password !== confirmPassword) {
    return res.status(422).json({ msg: "As senhas precisam ser iguais." });
  }

  try {
    const user = await findUserByEmail(normalizedEmail);
    const validation = await validateRecoveryCodeOrThrow(user, code);

    if (!validation.ok) {
      return res.status(400).json({ msg: validation.msg });
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(password, salt);
    user.updatedAt = new Date();
    user.resetPasswordCodeHash = undefined;
    user.resetPasswordCodeExpiresAt = undefined;
    user.resetPasswordCodeSentAt = undefined;

    await user.save();

    return res.status(200).json({ msg: "Senha atualizada com sucesso." });
  } catch (error) {
    console.log("resetUserPassword error", error);
    return res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

// delete user
const deleteUser = async (req, res) => {
  const { id } = req.params;

  console.log(req.params);

  if (!id) {
    return res.status(422).json({ msg: "Favor informar usuario." });
  }

  const user = await User.findById({ _id: id });

  if (!user) {
    return res.status(404).json({ msg: "Usuario nao encontrado!" });
  }

  try {
    const removeUser = await User.findOneAndDelete({ _id: id });

    return res
      .status(200)
      .send({ msg: `usuario deletado foi ${id}, ${removeUser.name}` });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ msg: `Usuario ${id} nao localizado!` });
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
    image,
    roleCodes,
    password,
  } = req.body;

  const normalizedEmail = normalizeEmail(email);

  if (!name) {
    return res.status(422).json({ msg: "O nome e obrigatorio" });
  }

  if (!normalizedEmail) {
    return res.status(422).json({ msg: "O email e obrigatorio" });
  }

  const userExists = await User.findOne({ _id: id });

  if (!userExists) {
    return res.status(422).json({ msg: "Usuario nao encontrado!" });
  }

  const duplicatedUser = await User.findOne({
    _id: { $ne: id },
    email: { $regex: new RegExp(`^${escapeRegex(normalizedEmail)}$`, "i") },
  });

  if (duplicatedUser) {
    return res.status(422).json({ msg: "Por favor, utilize outro e-mail." });
  }

  try {
    const updateData = {
      name,
      email: normalizedEmail,
      number,
      personalNumber,
      function: jobFunction,
      state,
      lotation,
      image,
      updatedAt: new Date(),
    };

    if (typeof password === "string" && password.trim() !== "") {
      const salt = await bcrypt.genSalt(12);
      updateData.password = await bcrypt.hash(password.trim(), salt);
    }

    if (roleCodes && Array.isArray(roleCodes)) {
      const roles = await Role.find({ code: { $in: roleCodes } });
      if (!roles.length) {
        return res.status(400).json({ msg: "Roles invalidas." });
      }
      updateData.roles = roles.map((r) => r._id);
    }

    await User.findByIdAndUpdate(id, updateData);

    const userListUpdated = await User.findById(id).populate("roles");
    return res.status(200).json({
      msg: "Usuario atualizado!",
      user: {
        name: userListUpdated.name,
        email: userListUpdated.email,
        number: userListUpdated.number,
        personalNumber: userListUpdated.personalNumber,
        function: userListUpdated.function,
        state: userListUpdated.state,
        lotation: userListUpdated.lotation,
        image: userListUpdated.image,
        _id: userListUpdated._id,
        roles: userListUpdated.roles.map((r) => ({
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
  previewMyAvatar,
  updateMyAvatar,
  getMyAvatar,
  previewUserAvatar,
  updateUserAvatar,
  getUserAvatar,
  requestPasswordResetCode,
  verifyPasswordResetCode,
  resetUserPassword,
};
