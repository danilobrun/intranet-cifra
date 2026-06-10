// IMPORTS
const mongoose = require("mongoose");

// Acesssos e propriedades dessa classe
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  resetPasswordCodeHash: String,
  resetPasswordCodeExpiresAt: Date,
  resetPasswordCodeSentAt: Date,
  number: String,
  personalNumber: String,
  function: String,
  state: String,
  lotation: String,
  image: String,
  avatarCpfEncrypted: {
    type: String,
    select: false,
  },
  roles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
  ],
  createdAt: Date,
  updatedAt: Date,
});

const User = mongoose.model("User", UserSchema);

// EXPORTS
module.exports = User;
