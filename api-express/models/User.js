// IMPORTS
const mongoose = require("mongoose");

// Acesssos e propriedades dessa classe
const User = mongoose.model("User", {
  name: String,
  email: String,
  password: String,
  type: Number,
  number: String,
  personalNumber: String,
  function: String,
  state: String,
  lotation: String,
  createdAt: Date,
  updatedAt: Date,
});

// EXPORTS
module.exports = User;
