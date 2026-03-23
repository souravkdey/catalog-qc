const Product = require("../models/Product");
const getChanges = require("../utils/getChanges");
const createLog = require("../utils/createLog");
const parseCSV = require("../utils/parseCSV");

const MAX_LIMIT = 50;
const ALLOWED_STATUS = ["active", "inactive"];

const handleServerError = (res, error, message = "Unknown Error") => {
  console.error(error);
  res.status(500).json({ message });
};

const toNumber = (value, fallback = 0) => {
  const num = Number(value);
  return isNaN(num) ? fallback : num;
};

exports.getProducts = async (req, res) => {
  try {
    let { page = "1", limit = "10", status } = req.query;

    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      return res.status(400).json({ message: "Invalid pagination values" });
    }

    limit = Math.min(limit, MAX_LIMIT);
    const skip = (page - 1) * limit;

    const filter = {};

    // default to active if status not provided
    if (status && status.trim() !== "") {
      if (!ALLOWED_STATUS.includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      filter.status = status;
    } else {
      filter.status = "active";
    }

    const [data, total] = await Promise.all([
      Product.find(filter).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);

    res.json({ total, page, limit, data });
  } catch (error) {
    handleServerError(res, error, "Internal server error");
  }
};

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

    handleServerError(res, error);
  }
};

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

    res.json(updatedProduct);
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

    handleServerError(res, error);
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // soft delete by marking status as archived
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

    handleServerError(res, error);
  }
};

exports.uploadCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const data = await parseCSV(req.file.path);

    const products = data.map((item) => ({
      title: item.title,
      sku: item.sku,
      price: toNumber(item.price),
      category: item.category,
      variants: [
        {
          name: item.variantName || "Default",
          price: toNumber(item.variantPrice, toNumber(item.price)),
          quantity: toNumber(item.quantity, 0),
        },
      ],
    }));

    await Product.insertMany(products);

    res.status(201).json({
      message: "CSV uploaded successfully",
      count: products.length,
    });
  } catch (error) {
    console.error("CSV UPLOAD ERROR:", error);
    handleServerError(res, error, "CSV upload failed");
  }
};
