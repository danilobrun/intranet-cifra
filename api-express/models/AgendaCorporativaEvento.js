const mongoose = require("mongoose");

const AGENDA_CORPORATIVA_VISIBILIDADES = [
  "PUBLICO",
  "PESSOAL",
  "DIRETORIA_ADMIN",
];
const AGENDA_CORPORATIVA_STATUSES = ["ATIVO", "CANCELADO"];

const AgendaCorporativaEventoSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    descricao: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
    dataInicio: {
      type: Date,
      required: true,
    },
    dataFim: {
      type: Date,
      required: true,
    },
    diaInteiro: {
      type: Boolean,
      default: false,
    },
    local: {
      type: String,
      default: "",
      trim: true,
      maxlength: 160,
    },
    visibilidade: {
      type: String,
      enum: AGENDA_CORPORATIVA_VISIBILIDADES,
      default: "PUBLICO",
      required: true,
    },
    status: {
      type: String,
      enum: AGENDA_CORPORATIVA_STATUSES,
      default: "ATIVO",
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
  },
  {
    timestamps: true,
    collection: "agenda_corporativa_eventos",
  },
);

AgendaCorporativaEventoSchema.path("dataFim").validate(function validateEndDate(
  dataFim,
) {
  if (!this.dataInicio || !dataFim) {
    return true;
  }

  return dataFim >= this.dataInicio;
}, "A data final nao pode ser menor que a data inicial.");

AgendaCorporativaEventoSchema.index({ dataInicio: 1, dataFim: 1 });
AgendaCorporativaEventoSchema.index({ status: 1 });
AgendaCorporativaEventoSchema.index({ visibilidade: 1 });
AgendaCorporativaEventoSchema.index({ createdAt: -1 });

const AgendaCorporativaEvento = mongoose.model(
  "AgendaCorporativaEvento",
  AgendaCorporativaEventoSchema,
);

module.exports = {
  AgendaCorporativaEvento,
  AGENDA_CORPORATIVA_STATUSES,
  AGENDA_CORPORATIVA_VISIBILIDADES,
};
