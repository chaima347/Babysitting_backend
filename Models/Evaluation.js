const mongoose = require("mongoose");
const { Schema } = mongoose;

const EvaluationSchema = new Schema(
  {
    babysitter: {
      type: Schema.Types.ObjectId,
      ref: "BabySitters",
      required: true,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Parents",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      maxlength: 500,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Evaluation = mongoose.model("Evaluations", EvaluationSchema);

module.exports = Evaluation;
