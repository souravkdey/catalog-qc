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
      // TODO: think — should this be required?
    },
  },
  {
    timestamps: true, // automatically adds createdAt
  }
);

module.exports = mongoose.model("Log", logSchema);
