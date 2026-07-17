const mongoose = require("mongoose");

const ClienteSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "clientes",
  },
);

const Cliente = mongoose.model("Cliente", ClienteSchema);

module.exports = Cliente;
