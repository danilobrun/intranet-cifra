const mongoose = require("mongoose");
const User = require("../../../models/User");
require("dotenv").config();

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

const main = async () => {
  await mongoose.connect(
    `mongodb+srv://${dbUser}:${dbPassword}@intranetcifra.1iksmgz.mongodb.net/?retryWrites=true&w=majority`
  );

  await User.updateMany(
    { number: { $exists: false } },
    { $set: { number: "" } }
  );

  console.log("Usuarios atualizados.");
  await mongoose.disconnect();
};

main().catch(console.error);
