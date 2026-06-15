const mongoose = require("mongoose");

const ResumoContratoSchema = new mongoose.Schema(
  {
    clienteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cliente",
      default: null,
      index: true,
    },
    nomeContrato: { type: String, trim: true, default: "" },
    orcamento: { type: Number, default: 0 },
    dataInicio: { type: Date, default: null },
    dataFim: { type: Date, default: null },
  },
  {
    timestamps: true,
    collection: "resumo_contratos",
  },
);

const ResumoContrato = mongoose.model("ResumoContrato", ResumoContratoSchema);

module.exports = ResumoContrato;
