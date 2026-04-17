const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema({
  cargo: { type: String, required: true },
  code: { type: String, unique: true, required: true },
  portals: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Portal",
      },
    ],
    default: [],
  },
});

const Role = mongoose.model("Role", RoleSchema);

module.exports = Role;
