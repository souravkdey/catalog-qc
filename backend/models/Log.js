const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: ["CREATE", "UPDATE", "DELETE"],
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    user: {
      type: String,
      default: "system", // TODO: replace later with real user
    },

    changes: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Log", logSchema);
