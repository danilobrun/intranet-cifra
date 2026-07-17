const mongoose = require("mongoose");
const Cliente = require("../../../models/Cliente");
const ResumoContrato = require("../../../models/ResumoContrato");

require("dotenv").config();

const getMongoUri = () => {
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }

  const dbUser = process.env.DB_USER;
  const dbPassword = process.env.DB_PASS;

  if (!dbUser || !dbPassword) {
    throw new Error(
      "Informe MONGODB_URI ou as variaveis DB_USER e DB_PASS.",
    );
  }

  return `mongodb+srv://${encodeURIComponent(dbUser)}:${encodeURIComponent(
    dbPassword,
  )}@intranetcifra.1iksmgz.mongodb.net/?retryWrites=true&w=majority`;
};

const main = async () => {
  await mongoose.connect(getMongoUri());

  try {
    const [clientesResult, contratosResult] = await Promise.all([
      Cliente.updateMany(
        { active: { $exists: false } },
        { $set: { active: true } },
        { timestamps: false },
      ),
      ResumoContrato.updateMany(
        { active: { $exists: false } },
        { $set: { active: true } },
        { timestamps: false },
      ),
    ]);

    console.log(
      `Clientes encontrados: ${clientesResult.matchedCount}; atualizados: ${clientesResult.modifiedCount}.`,
    );
    console.log(
      `Contratos encontrados: ${contratosResult.matchedCount}; atualizados: ${contratosResult.modifiedCount}.`,
    );
  } finally {
    await mongoose.disconnect();
  }
};

main().catch((error) => {
  console.error("Falha ao atualizar o campo active.", error);
  process.exitCode = 1;
});
