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

  const roles = await Role.find({});
  const roleMap = {};
  roles.forEach((r, i) => {
    console.log(
      `${i + 1}. ${r.code} - ${r.cargo} | ${r.empresa} | ${r.contrato}`
    );
    roleMap[i + 1] = r;
  });

  const users = await User.find({ roles: { $exists: false }, type: 2 });

  for (const user of users) {
    console.log(`\n👤 Usuário: ${user.name} (${user.email})`);
    const resposta = await prompt(
      `Digite o número da role que deseja atribuir (ou ENTER para pular): `
    );

    const numero = parseInt(resposta);
    if (!numero || !roleMap[numero]) {
      console.log("⏭️ Usuário pulado.");
      continue;
    }

    user.roles = [roleMap[numero]._id];
    user.type = undefined;
    await user.save();
    console.log(`✅ Role atribuída: ${roleMap[numero].code}`);
  }

  await mongoose.disconnect();
  console.log("\n🎉 Finalizado.");
}

function prompt(msg) {
  return new Promise((resolve) => {
    process.stdout.write(msg);
    process.stdin.once("data", (data) => resolve(data.toString().trim()));
  });
}

main();
