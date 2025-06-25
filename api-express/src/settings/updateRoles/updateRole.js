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

    const roleAntiga = await Role.findOne({ code: "2-2" });
    const roleNova = await Role.findOne({ code: "3" });

    if (!roleAntiga || !roleNova) {
      console.error("❌ Role antiga ou nova não encontrada");
      return;
    }

    const usuarios = await User.find({ roles: roleAntiga._id });

    console.log(`📌 Usuários encontrados com role 2-2: ${usuarios.length}`);

    for (const user of usuarios) {
      // Remove a antiga e adiciona a nova se necessário
      user.roles = user.roles
        .filter((r) => !r.equals(roleAntiga._id)) // remove a antiga
        .concat([roleNova._id]); // adiciona a nova

      await user.save();
      console.log(`✅ Atualizado: ${user.email}`);
    }

    console.log("🎉 Atualização concluída!");
    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Erro ao atualizar usuários:", err);
    process.exit(1);
  }
}

atualizarRoleUsuarios();
