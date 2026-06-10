const mongoose = require("mongoose");

const BoletimSchema = new mongoose.Schema(
  {
    contratoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contrato",
      required: true,
    },
    numeroBm: { type: String, required: true, trim: true },
    mes: { type: Number, required: true, min: 1, max: 12 },
    ano: { type: Number, required: true },
    valorBm: { type: Number, required: true },
    reajuste: { type: Number, default: 0 },
    dataRegistro: { type: Date, required: true },
    observacoes: { type: String, trim: true, default: "" },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
    collection: "boletins",
  },
);

BoletimSchema.index(
  { contratoId: 1, numeroBm: 1, mes: 1, ano: 1 },
  {
    unique: true,
    partialFilterExpression: { deletedAt: { $exists: false } },
  },
);

const Boletim = mongoose.model("Boletim", BoletimSchema);

module.exports = Boletim;
