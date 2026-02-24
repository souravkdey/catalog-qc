const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
});

const productSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 120,
      trim: true,
    },
    variants: {
      type: [variantSchema],
      required: true,
      validate: {
        validator: function (variants) {
          if (!variants || variants.length === 0) return false;

          const names = variants.map((v) => v.name.toLowerCase());
          return new Set(names).size === names.length;
        },
        message:
          "Product must have at least one variant and variant names must be unique",
      },
    },
    status: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
