// IMPORTS
const mongoose = require("mongoose");

// Acesssos e proriedades dessa classe
const Portal = mongoose.model("Portal", {
  name: String,
  responsible: String,
  description: String,
  shortDescription: String,
  image: String,
  url: String,
  baseLink: String,
  updateSchedule: String,
  nameBi: String,
  emailResponsible: String,
  createdAt: Date,
  updatedAt: Date,
});

// EXPORTS
module.exports = Portal;
