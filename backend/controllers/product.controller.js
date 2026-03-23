const Product = require("../models/Product");
const getChanges = require("../utils/getChanges");
const createLog = require("../utils/createLog");

// GET PRODUCTS
exports.getProducts = async (req, res) => {
  try {
    let { page = "1", limit = "10", status } = req.query;

    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      return res.status(400).json({ message: "Invalid pagination values" });
    }

    limit = Math.min(limit, 50);
    const skip = (page - 1) * limit;

    const allowedStatus = ["active", "inactive"];
    const filter = {};

    if (status && status.trim() !== "") {
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      filter.status = status;
    } else {
      filter.status = "active";
    }

    const data = await Product.find(filter).skip(skip).limit(limit);
    const total = await Product.countDocuments(filter);

    res.json({ total, page, limit, data });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// CREATE
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    await createLog({
      action: "CREATE",
      productId: product._id,
      before: null,
      after: product.toObject(),
    });

    res.status(201).json(product);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "SKU Already Exists" });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Unknown Error" });
  }
};

// UPDATE
exports.updateProduct = async (req, res) => {
  try {
    const oldProduct = await Product.findById(req.params.id);

    if (!oldProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    const changes = getChanges(
      oldProduct.toObject(),
      updatedProduct.toObject()
    );

    await createLog({
      action: "UPDATE",
      productId: updatedProduct._id,
      before: changes.before,
      after: changes.after,
    });

    res.status(200).json(updatedProduct);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    if (error.code === 11000) {
      return res.status(409).json({ message: "SKU Already Exists" });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Unknown Error" });
  }
};

// DELETE
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await Product.findByIdAndUpdate(req.params.id, {
      status: "archived",
    });

    await createLog({
      action: "DELETE",
      productId: product._id,
      before: product.toObject(),
      after: null,
    });

    res.json({ message: "Product deleted" });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    res.status(500).json({ message: "Unknown Error" });
  }
};
