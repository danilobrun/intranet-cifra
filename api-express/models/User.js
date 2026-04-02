// IMPORTS
const mongoose = require("mongoose");

// Acesssos e propriedades dessa classe
const User = mongoose.model("User", {
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

// EXPORTS
module.exports = User;
