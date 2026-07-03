const mongoose = require("mongoose");
const {
  normalizeCentroCustoKey,
  normalizeCentroCustoNome,
} = require("../src/helpers/centroCusto");

const CentroCustoSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      set: normalizeCentroCustoNome,
      trim: true,
    },
    nomeNormalizado: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      select: false,
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
  },
  {
    timestamps: true,
    collection: "centros_custo",
  },
);

CentroCustoSchema.pre("validate", function setNormalizedName(next) {
  this.nome = normalizeCentroCustoNome(this.nome);
  this.nomeNormalizado = normalizeCentroCustoKey(this.nome);
  next();
});

CentroCustoSchema.index({ nomeNormalizado: 1 }, { unique: true });
CentroCustoSchema.index({ nome: 1 });
CentroCustoSchema.index({ createdAt: -1 });

const CentroCusto = mongoose.model("CentroCusto", CentroCustoSchema);

module.exports = CentroCusto;
