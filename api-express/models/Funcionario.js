const mongoose = require("mongoose");
const { normalizeCpf } = require("../src/helpers/cpf");

const FUNCIONARIO_STATUSES = ["Ativo", "Inativo"];
const FUNCIONARIO_ORIGENS = ["Manual", "Importacao CSV"];

const FuncionarioSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
    },
    cpf: {
      type: String,
      required: true,
      unique: true,
      set: normalizeCpf,
      trim: true,
    },
    centroCusto: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: FUNCIONARIO_STATUSES,
      default: "Ativo",
      required: true,
    },
    origem: {
      type: String,
      enum: FUNCIONARIO_ORIGENS,
      default: "Manual",
      required: true,
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
  },
  {
    timestamps: true,
    collection: "funcionarios",
  },
);

FuncionarioSchema.index({ cpf: 1 }, { unique: true });
FuncionarioSchema.index({ status: 1 });
FuncionarioSchema.index({ centroCusto: 1 });
FuncionarioSchema.index({ createdAt: -1 });

const Funcionario = mongoose.model("Funcionario", FuncionarioSchema);

module.exports = Funcionario;
