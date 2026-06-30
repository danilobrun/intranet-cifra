const mongoose = require("mongoose");

const normalizePlate = (value) => {
  if (value === null || value === undefined) return value;

  return String(value).replace(/[\s-]/g, "").toUpperCase();
};

const PlateSchema = new mongoose.Schema(
  {
    placa: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      set: normalizePlate,
      trim: true,
    },
    condutor: {
      type: String,
      default: "",
      trim: true,
    },
    contrato: {
      type: String,
      default: "",
      trim: true,
    },
    estado: {
      type: String,
      default: "",
      trim: true,
    },
    crlv: {
      type: String,
      default: "",
      trim: true,
    },
    responsavel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["ATIVA", "INATIVA"],
      default: "ATIVA",
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "plates",
  },
);

PlateSchema.index({ placa: 1 }, { unique: true });
PlateSchema.index({ status: 1 });
PlateSchema.index({ condutor: 1, contrato: 1, estado: 1 });

const Plate = mongoose.model("Plate", PlateSchema);

module.exports = Plate;
