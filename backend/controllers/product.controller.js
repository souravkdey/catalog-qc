const validateProduct = require("../utils/validateProduct");
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

    await Product.findByIdAndUpdate(req.params.id, { status: "archived" }); // soft delete

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

    const validProducts = [];
    const errors = [];

    // Preload existing SKUs for performance
    const existingProducts = await Product.find({}, { sku: 1 });
    const existingSkuSet = new Set(existingProducts.map((p) => p.sku));

    // Track duplicates inside CSV
    const csvSkuSet = new Set();

    for (let i = 0; i < data.length; i++) {
      const item = data[i];

      const product = {
        name: item.name?.trim() || item.title?.trim(),
        sku: item.sku?.trim(),
        price: item.price,
        category: item.category,
        variants: [
          {
            name: item.variantName?.trim() || "Default",
            price: item.variantPrice ?? item.price,
            quantity: item.quantity,
          },
        ],
      };

      const result = validateProduct(product);

      if (!result.isValid) {
        errors.push({
          row: i + 2, // assuming header row exists
          message: result.errors,
        });
        continue;
      }

      // Duplicate check (DB + CSV)
      if (existingSkuSet.has(product.sku)) {
        errors.push({
          row: i + 2,
          message: ["Duplicate SKU in database"],
        });
        continue;
      }

      if (csvSkuSet.has(product.sku)) {
        errors.push({
          row: i + 2,
          message: ["Duplicate SKU in CSV file"],
        });
        continue;
      }

      csvSkuSet.add(product.sku);

      // Safe numeric conversion
      const price = Number(product.price);
      const variantPrice = Number(product.variants[0].price);
      const quantity = Number(product.variants[0].quantity);

      if (
        Number.isNaN(price) ||
        Number.isNaN(variantPrice) ||
        Number.isNaN(quantity)
      ) {
        errors.push({
          row: i + 2,
          message: ["Invalid numeric values in price/variant/quantity"],
        });
        continue;
      }

      product.price = price;
      product.variants[0].price = variantPrice;
      product.variants[0].quantity = quantity;

      validProducts.push(product);
    }

    if (validProducts.length > 0) {
      await Product.insertMany(validProducts);
    }

    res.status(201).json({
      message: "CSV processed",
      total: data.length,
      saved: validProducts.length,
      failed: errors.length,
      errors,
    });
  } catch (error) {
    console.error("CSV UPLOAD ERROR:", error);
    handleServerError(res, error, "CSV upload failed");
  }
};
