// IMPORTS
const mongoose = require("mongoose");

// Acesso e prioridade dessa classe criando uma model
const Update = mongoose.model("Update", {
  portalId: String,
  name: String,
  hh: Number,
  mm: Number,
  period: String,
  url: String,
  createdAt: Date,
  updatedAt: Date,
});
// EXPORTS
module.exports = Update;
