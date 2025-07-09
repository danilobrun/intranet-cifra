const mongoose = require("mongoose");
const Portal = require("../../../models/Portal");
require("dotenv").config();

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

const main = async () => {
  await mongoose.connect(
    `mongodb+srv://${dbUser}:${dbPassword}@intranetcifra.1iksmgz.mongodb.net/?retryWrites=true&w=majority`
  );

  // Buscar todos os portais antigos que têm os campos avulsos
  const portals = await Portal.find({});

  for (const portal of portals) {
    const detail = {
      url: portal.url || "",
      baseLink: portal.baseLink || "",
      updateSchedule: portal.updateSchedule || "",
      nameForm: portal.nameForm || "",
      emailResponsible: portal.emailResponsible || "",
    };

    console.log("Migrando portal:", portal.name);
    console.log("Novo details:", detail);

    // Atualizar documento
    await Portal.updateOne(
      { _id: portal._id },
      {
        $set: {
          details: [detail],
        },
        $unset: {
          baseLink: "",
          updateSchedule: "",
          nameForm: "",
          emailResponsible: "",
        },
      }
    );
  }

  console.log("Migração de campos para 'details' finalizada com sucesso.");
  await mongoose.disconnect();
};

main().catch(console.error);
