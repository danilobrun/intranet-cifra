const mongoose = require("mongoose");

const TutorialStepSchema = new mongoose.Schema(
  {
    order: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    youtubeUrl: { type: String, trim: true, default: "" },
    youtubeVideoId: { type: String, trim: true, default: "" },
    note: { type: String, trim: true, default: "" },
    warning: { type: String, trim: true, default: "" },
    expectedResult: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const TutorialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    summary: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["rascunho", "publicado", "arquivado"],
      default: "rascunho",
      index: true,
    },
    steps: {
      type: [TutorialStepSchema],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    publishedAt: Date,
    archivedAt: Date,
  },
  {
    timestamps: true,
  },
);

const Tutorial = mongoose.model("Tutorial", TutorialSchema);

module.exports = Tutorial;
