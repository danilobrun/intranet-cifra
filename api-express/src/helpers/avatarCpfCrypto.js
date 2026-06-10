const crypto = require("crypto");

const ALGORITHM = "aes-256-gcm";
const SECRET_ENV_NAME = "AVATAR_CPF_SECRET_KEY";
const VERSION = "v1";
const IV_LENGTH = 12;

class AvatarCryptoConfigError extends Error {
  constructor() {
    super("Avatar CPF encryption key is not configured.");
    this.name = "AvatarCryptoConfigError";
  }
}

class AvatarCryptoDecryptError extends Error {
  constructor() {
    super("Avatar CPF encrypted value could not be decrypted.");
    this.name = "AvatarCryptoDecryptError";
  }
}

const getEncryptionKey = () => {
  const secret = String(process.env[SECRET_ENV_NAME] || "").trim();

  if (!secret) {
    throw new AvatarCryptoConfigError();
  }

  return crypto.createHash("sha256").update(secret).digest();
};

const encryptAvatarCpf = (cpf) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);

  const encrypted = Buffer.concat([
    cipher.update(String(cpf), "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    VERSION,
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
};

const decryptAvatarCpf = (encryptedCpf) => {
  try {
    const [version, ivHex, authTagHex, encryptedHex] = String(
      encryptedCpf || "",
    ).split(":");

    if (version !== VERSION || !ivHex || !authTagHex || !encryptedHex) {
      throw new Error("Invalid encrypted CPF format.");
    }

    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      getEncryptionKey(),
      Buffer.from(ivHex, "hex"),
    );

    decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

    return Buffer.concat([
      decipher.update(Buffer.from(encryptedHex, "hex")),
      decipher.final(),
    ]).toString("utf8");
  } catch (error) {
    if (error instanceof AvatarCryptoConfigError) {
      throw error;
    }

    throw new AvatarCryptoDecryptError();
  }
};

module.exports = {
  SECRET_ENV_NAME,
  AvatarCryptoConfigError,
  AvatarCryptoDecryptError,
  encryptAvatarCpf,
  decryptAvatarCpf,
};
