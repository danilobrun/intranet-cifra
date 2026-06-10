const mongoose = require("mongoose");

const ResumoContratoBmSchema = new mongoose.Schema(
  {
    contratoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ResumoContrato",
      required: true,
    },
    mes: { type: Number, required: true, min: 1, max: 12 },
    ano: { type: Number, required: true },
    valorBm: { type: Number, required: true },
  },
  {
    timestamps: true,
    collection: "resumo_contrato_bms",
  },
);

ResumoContratoBmSchema.index(
  { contratoId: 1, ano: 1, mes: 1 },
  { unique: true },
);

const ResumoContratoBm = mongoose.model(
  "ResumoContratoBm",
  ResumoContratoBmSchema,
);

module.exports = ResumoContratoBm;
