const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema({
  cargo: { type: String, required: true },
  code: { type: String, unique: true, required: true },
});

const Role = mongoose.model("Role", RoleSchema);

module.exports = Role;
