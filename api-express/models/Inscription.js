// IMPORTS
const mongoose = require("mongoose");

// Acesssos e proriedades dessa classe
const Inscription = mongoose.model("Inscription", {
  name: String,
  email: String,
  portalId: String,
  userId: String,
  createdAt: Date,
  updatedAt: Date,
});

// EXPORTS
module.exports = Inscription;
