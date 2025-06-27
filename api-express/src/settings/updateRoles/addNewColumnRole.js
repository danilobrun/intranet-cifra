const mongoose = require("mongoose");
const Role = require("../../../models/Role");
require("dotenv").config();

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

const main = async () => {
  await mongoose.connect(
    `mongodb+srv://${dbUser}:${dbPassword}@intranetcifra.1iksmgz.mongodb.net/?retryWrites=true&w=majority`
  );

  await Role.updateMany(
    { cod_contrato: { $exists: false } },
    { $set: { cod_contrato: "" } }
  );

  console.info("Documentos de Role atualizados.");
  await mongoose.disconnect();
};

main();
