const mongoose = require("mongoose");

const FaturamentoSchema = new mongoose.Schema(
  {
    boletimId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Boletim",
      required: true,
    },
    valorFaturado: { type: Number, required: true },
    dataFaturamento: { type: Date, required: true },
  },
  {
    collection: "faturamentos",
  },
);

const Faturamento = mongoose.model("Faturamento", FaturamentoSchema);

module.exports = Faturamento;
