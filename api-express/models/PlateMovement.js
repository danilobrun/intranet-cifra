const mongoose = require("mongoose");

const PlateMovementSchema = new mongoose.Schema(
  {
    placa: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    plateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plate",
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: ["CREATE", "UPDATE", "DELETE", "RESTORE"],
      required: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    previousData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    newData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    changes: {
      type: [
        {
          field: {
            type: String,
            required: true,
          },
          from: mongoose.Schema.Types.Mixed,
          to: mongoose.Schema.Types.Mixed,
        },
      ],
      default: [],
    },
  },
  {
    collection: "plate_movements",
  },
);

PlateMovementSchema.index({ plateId: 1, changedAt: -1 });
PlateMovementSchema.index({ placa: 1, changedAt: -1 });
PlateMovementSchema.index({ action: 1 });

const PlateMovement = mongoose.model("PlateMovement", PlateMovementSchema);

module.exports = PlateMovement;
