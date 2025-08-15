const mongoose = require("mongoose");
const Role = require("../../../models/Role");
const User = require("../../../models/User");
require("dotenv").config();

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

async function main() {
  await mongoose.connect(
    `mongodb+srv://${dbUser}:${dbPassword}@intranetcifra.1iksmgz.mongodb.net/?retryWrites=true&w=majority`
  );
  console.log("🔌 Conectado ao MongoDB");

  const result = await User.updateMany(
    {
      $or: [{ image: { $exists: false } }, { imagem: null }],
    },
    {
      $set: {
        image: "",
        updatedAt: new Date(),
      },
    }
  );

  console.log(`✅ Usuários atualizados: ${result.modifiedCount}`);
  await mongoose.disconnect();
  console.log("\n🎉 Finalizado.");
}

main();
