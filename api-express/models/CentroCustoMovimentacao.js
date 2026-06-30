const mongoose = require("mongoose");
const { normalizeCpf } = require("../src/helpers/cpf");

const CENTRO_CUSTO_MOVIMENTACAO_STATUSES = [
  "Pendente",
  "Aplicado na Folha",
];

const CentroCustoMovimentacaoSchema = new mongoose.Schema(
  {
    funcionarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Funcionario",
      required: true,
    },
    nome: {
      type: String,
      required: true,
      trim: true,
    },
    cpf: {
      type: String,
      required: true,
      set: normalizeCpf,
      trim: true,
    },
    centroCustoAnterior: {
      type: String,
      required: true,
      trim: true,
    },
    novoCentroCusto: {
      type: String,
      required: true,
      trim: true,
    },
    dataAlteracao: {
      type: Date,
      required: true,
    },
    observacao: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: CENTRO_CUSTO_MOVIMENTACAO_STATUSES,
      default: "Pendente",
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
    appliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    appliedAt: Date,
  },
  {
    timestamps: true,
    collection: "centro_custo_movimentacoes",
  },
);

CentroCustoMovimentacaoSchema.index({ funcionarioId: 1 });
CentroCustoMovimentacaoSchema.index({ cpf: 1 });
CentroCustoMovimentacaoSchema.index({ status: 1 });
CentroCustoMovimentacaoSchema.index({ createdAt: -1 });
CentroCustoMovimentacaoSchema.index({ dataAlteracao: -1 });

const CentroCustoMovimentacao = mongoose.model(
  "CentroCustoMovimentacao",
  CentroCustoMovimentacaoSchema,
);

module.exports = CentroCustoMovimentacao;
