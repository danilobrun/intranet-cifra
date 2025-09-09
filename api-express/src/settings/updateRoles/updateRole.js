const mongoose = require("mongoose");
const Role = require("../../../models/Role");
const User = require("../../../models/User");
require("dotenv").config();

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

async function atualizarRoleUsuarios() {
  try {
    await mongoose.connect(
      `mongodb+srv://${dbUser}:${dbPassword}@intranetcifra.1iksmgz.mongodb.net/?retryWrites=true&w=majority`
    );
    console.log("🔌 Conectado ao MongoDB");

    const roles = await Role.find({});
    const roleMap = {};
    roles.forEach((r, i) => {
      console.log(`${i + 1} - ${r.cargo}`);
      roleMap[i + 1] = r;
    });

    console.log("0 - Pular");

    const users = await User.find();
    for (const user of users) {
      console.log(`Atualizando usuário: ${user.name}`);
      const resposta = await prompt(
        `Qual role deseja atribuir ao usuário ${user.name}?`
      );

      const numero = parseInt(resposta);
      if (numero === 0) {
        console.log("Usuário Pulado");
        continue;
      }

      user.roles = [roleMap[numero]._id];
      await user.save();
      console.log(
        `Role ${roleMap[numero].cargo} atribuída ao usuário ${user.name}`
      );
    }

    await mongoose.disconnect();
    console.log("\n🎉 Finalizado.");
  } catch (err) {
    console.error("❌ Erro ao atualizar usuários:", err);
    process.exit(1);
  }

  function prompt(msg) {
    return new Promise((resolve) => {
      process.stdout.write(msg);
      process.stdin.once("data", (data) => resolve(data.toString().trim()));
    });
  }
}

atualizarRoleUsuarios();
