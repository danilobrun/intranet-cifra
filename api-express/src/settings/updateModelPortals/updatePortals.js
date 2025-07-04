const mongoose = require("mongoose");
const Portal = require("../../../models/Portal");
require("dotenv").config();

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

const main = async () => {
  await mongoose.connect(
    `mongodb+srv://${dbUser}:${dbPassword}@intranetcifra.1iksmgz.mongodb.net/?retryWrites=true&w=majority`
  );

  await Portal.updateMany(
    {
      emailResponsible: { $exists: false },
    },
    {
      $set: {
        emailResponsible: "",
      },
    }
  );

  console.log("Documentos de Portal atualizados.");
  await mongoose.disconnect();
};

main().catch(console.error);
