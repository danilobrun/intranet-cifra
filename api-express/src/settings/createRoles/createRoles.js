const mongoose = require("mongoose");
require("dotenv").config();
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

const Role = require("../../../models/Role");

const rolesToSeed = [
  {
    code: "1",
    cargo: "admin",
    empresa: "*",
    contrato: "*",
  },
  {
    code: "2-1",
    cargo: "gerente",
    empresa: "compesa",
    contrato: "*",
  },
  {
    code: "2-2",
    cargo: "gerente",
    empresa: "brk",
    contrato: "*",
  },
  {
    code: "2-2-1",
    cargo: "gerente",
    empresa: "brk",
    contrato: "pavimentacao",
  },
  {
    code: "2-2-2",
    cargo: "gerente",
    empresa: "brk",
    contrato: "fiscalizacao",
  },
  {
    code: "3",
    cargo: "funcionario",
    empresa: "*",
    contrato: "*",
  },
];

const main = async () => {
  await mongoose.connect(
    `mongodb+srv://${dbUser}:${dbPassword}@intranetcifra.1iksmgz.mongodb.net/?retryWrites=true&w=majority`
  );

  for (const role of rolesToSeed) {
    await Role.create(role);
    console.log(`Cargo ${role.cargo} criado com sucesso!`);
  }

  console.log("Cargos criados.");
  await mongoose.disconnect();
};

main();
