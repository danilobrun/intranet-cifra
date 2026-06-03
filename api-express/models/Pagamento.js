const mongoose = require("mongoose");

const PagamentoSchema = new mongoose.Schema(
  {
    boletimId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Boletim",
      required: true,
    },
    valorPago: { type: Number, required: true },
    dataPagamento: { type: Date, required: true },
  },
  {
    collection: "pagamentos",
  },
);

const Pagamento = mongoose.model("Pagamento", PagamentoSchema);

module.exports = Pagamento;
