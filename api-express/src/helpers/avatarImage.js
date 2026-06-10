const https = require("https");
const { URL } = require("url");

const AVATAR_BASE_URL = "https://intranet-cifra.netlify.app/funcionarios";
const MAX_REDIRECTS = 3;
const REQUEST_TIMEOUT_MS = 8000;

const AVATAR_EXTENSIONS = [
  {
    extension: ".jpeg",
    contentType: "image/jpeg",
    fileName: "avatar.jpeg",
  },
  {
    extension: ".jpg",
    contentType: "image/jpeg",
    fileName: "avatar.jpeg",
  },
  {
    extension: ".png",
    contentType: "image/png",
    fileName: "avatar.png",
  },
];

class AvatarImageFetchError extends Error {
  constructor() {
    super("Avatar image could not be fetched.");
    this.name = "AvatarImageFetchError";
  }
}

const buildAvatarUrl = (cpf, extension) =>
  `${AVATAR_BASE_URL}/${encodeURIComponent(cpf)}${extension}`;

const isValidImageBuffer = (buffer, extension) => {
  if (!Buffer.isBuffer(buffer) || buffer.length < 4) {
    return false;
  }

  if (extension === ".png") {
    return (
      buffer.length >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    );
  }

  return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
};

const requestBuffer = (url, redirectCount = 0) =>
  new Promise((resolve, reject) => {
    const request = https.get(
      url,
      {
        headers: {
          Accept: "image/jpeg,image/png",
        },
      },
      (response) => {
        const statusCode = response.statusCode || 0;
        const location = response.headers.location;

        if (
          statusCode >= 300 &&
          statusCode < 400 &&
          location &&
          redirectCount < MAX_REDIRECTS
        ) {
          response.resume();
          requestBuffer(new URL(location, url).toString(), redirectCount + 1)
            .then(resolve)
            .catch(reject);
          return;
        }

        if (statusCode < 200 || statusCode >= 300) {
          response.resume();
          resolve({ ok: false });
          return;
        }

        const chunks = [];

        response.on("data", (chunk) => {
          chunks.push(chunk);
        });

        response.on("end", () => {
          resolve({
            ok: true,
            buffer: Buffer.concat(chunks),
          });
        });

        response.on("error", reject);
      },
    );

    request.setTimeout(REQUEST_TIMEOUT_MS, () => {
      request.destroy(new Error("Avatar image request timed out."));
    });

    request.on("error", reject);
  });

const findAvatarImageByCpf = async (cpf) => {
  let hasFetchError = false;

  for (const avatarExtension of AVATAR_EXTENSIONS) {
    try {
      const result = await requestBuffer(
        buildAvatarUrl(cpf, avatarExtension.extension),
      );

      if (
        result.ok &&
        isValidImageBuffer(result.buffer, avatarExtension.extension)
      ) {
        return {
          ...avatarExtension,
          buffer: result.buffer,
        };
      }
    } catch (error) {
      hasFetchError = true;
    }
  }

  if (hasFetchError) {
    throw new AvatarImageFetchError();
  }

  return null;
};

module.exports = {
  AVATAR_EXTENSIONS,
  AvatarImageFetchError,
  findAvatarImageByCpf,
};
