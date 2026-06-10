const mongoose = require("mongoose");

const CONTRATO_ESTADOS = ["Pernambuco", "Sergipe", "Alagoas", "Piau\u00ed"];
const CONTRATO_STATUSES = ["Ativo", "Inativo"];

const ContratoSchema = new mongoose.Schema(
  {
    codigo: { type: String, required: true, trim: true },
    nomeContrato: { type: String, required: true, trim: true },
    cliente: { type: String, required: true, trim: true },
    estado: {
      type: String,
      enum: CONTRATO_ESTADOS,
      required: true,
      trim: true,
    },
    descricao: { type: String, trim: true, default: "" },
    gestorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dataInicio: { type: Date, required: true },
    dataFim: Date,
    status: {
      type: String,
      enum: CONTRATO_STATUSES,
      default: "Ativo",
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    inactivatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    inactivatedAt: Date,
    reactivatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reactivatedAt: Date,
  },
  {
    timestamps: true,
    collection: "contratos",
  },
);

const Contrato = mongoose.model("Contrato", ContratoSchema);

module.exports = Contrato;
