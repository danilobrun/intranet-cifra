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
    bm: { type: String, trim: true, default: "" },
    bmInicio: { type: Date, default: null },
    bmFim: { type: Date, default: null },
    valorBm: { type: Number, default: 0 },
    faturadoData: { type: Date, default: null },
  },
  {
    timestamps: true,
    collection: "resumo_contrato_bms",
  },
);
ResumoContratoBmSchema.index({ contratoId: 1, ano: 1, mes: 1 });

const ResumoContratoBm = mongoose.model(
  "ResumoContratoBm",
  ResumoContratoBmSchema,
);

module.exports = ResumoContratoBm;
