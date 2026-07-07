const allowedOrigins = [
  "http://localhost:3000",
  "https://intranet-cifra.netlify.app",
];

const normalizeOrigin = (origin = "") => String(origin).trim().replace(/\/+$/, "");

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(normalizeOrigin(origin))) {
      callback(null, true);
      return;
    }

    callback(new Error("Origem nao permitida pelo CORS."));
  },
};

module.exports = {
  allowedOrigins,
  corsOptions,
};
