const mongoose = require("mongoose");
require("dotenv").config();
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

const Role = require("../../../models/Role");

const rolesToSeed = [
  {
    code: "2-2-3",
    cargo: "gerente",
    empresa: "brk",
    contrato: "hidrometracao",
    cod_contrato: "HD",
  },
  {
    code: "2-3",
    cargo: "gerente",
    empresa: "deso",
    contrato: "*",
    cod_contrato: "DESO",
  },
  {
    code: "2-3-1",
    cargo: "gerente",
    empresa: "deso",
    contrato: "corte e religacao",
    cod_contrato: "CR",
  },
  {
    code: "2-3-2",
    cargo: "gerente",
    empresa: "deso",
    contrato: "cadastro tecnico",
    cod_contrato: "CT",
  },
  {
    code: "2-3-3",
    cargo: "gerente",
    empresa: "deso",
    contrato: "hidrometracao",
    cod_contrato: "HD",
  },
  {
    code: "2-3-4",
    cargo: "gerente",
    empresa: "deso",
    contrato: "macromedidores",
    cod_contrato: "MM",
  },
  {
    code: "2-4",
    cargo: "gerente",
    empresa: "casal",
    contrato: "*",
    cod_contrato: "CASAL",
  },
  {
    code: "2-4-1",
    cargo: "gerente",
    empresa: "casal",
    contrato: "corte e religacao",
    cod_contrato: "CR",
  },
  {
    code: "2-4-2",
    cargo: "gerente",
    empresa: "casal",
    contrato: "hidrometracao",
    cod_contrato: "HD",
  },
  {
    code: "2-5",
    cargo: "gerente",
    empresa: "caern",
    contrato: "*",
    cod_contrato: "CAERN",
  },
  {
    code: "2-5-1",
    cargo: "gerente",
    empresa: "caern",
    contrato: "hidrometracao",
    cod_contrato: "HD",
  },
  {
    code: "2-1-1",
    cargo: "gerente",
    empresa: "compesa",
    contrato: "recuperacao de clientes cortados",
    cod_contrato: "RCCP",
  },
  {
    code: "2-1-2",
    cargo: "gerente",
    empresa: "compesa",
    contrato: "corte e religacao",
    cod_contrato: "CR",
  },
  {
    code: "2-6",
    cargo: "gerente",
    empresa: "obras",
    contrato: "*",
    cod_contrato: "OBRAS",
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
