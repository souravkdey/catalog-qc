const Product = require("../models/Product");
const validateProduct = require("../utils/validateProduct");
const getChanges = require("../utils/getChanges");
const createLog = require("../utils/createLog");
const parseCSV = require("../utils/parseCSV");

const MAX_LIMIT = 50;
const ALLOWED_STATUS = ["active", "inactive", "archived"];

const toNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isNaN(num) ? fallback : num;
};

exports.getProducts = async (query) => {
  let { page = "1", limit = "10", status } = query;

  page = parseInt(page, 10);
  limit = parseInt(limit, 10);

  if (Number.isNaN(page) || Number.isNaN(limit) || page < 1 || limit < 1) {
    const err = new Error("Invalid pagination values");
    err.status = 400;
    throw err;
  }

  limit = Math.min(limit, MAX_LIMIT);
  const skip = (page - 1) * limit;

  const filter = {};

  if (status && status.trim() !== "") {
    if (!ALLOWED_STATUS.includes(status)) {
      const err = new Error("Invalid status value");
      err.status = 400;
      throw err;
    }

    filter.status = status;
  } else {
    filter.status = "active";
  }

  const [data, total] = await Promise.all([
    Product.find(filter).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);

  return { total, page, limit, data };
};

exports.createProduct = async (body) => {
  const product = await Product.create(body);

  await createLog({
    action: "CREATE",
    productId: product._id,
    before: null,
    after: product.toObject(),
  });

  return product;
};

exports.updateProduct = async (id, body) => {
  const oldProduct = await Product.findById(id);

  if (!oldProduct) {
    const err = new Error("Product not found");
    err.status = 404;
    throw err;
  }

  const updatedProduct = await Product.findByIdAndUpdate(id, body, {
    new: true,
    runValidators: true,
  });

  const changes = getChanges(oldProduct.toObject(), updatedProduct.toObject());

  await createLog({
    action: "UPDATE",
    productId: updatedProduct._id,
    before: changes.before,
    after: changes.after,
  });

  return updatedProduct;
};

exports.deleteProduct = async (id) => {
  const product = await Product.findById(id);

  if (!product) {
    const err = new Error("Product not found");
    err.status = 404;
    throw err;
  }

  await Product.findByIdAndUpdate(id, { status: "archived" });

  await createLog({
    action: "DELETE",
    productId: product._id,
    before: product.toObject(),
    after: null,
  });
};

exports.uploadCSV = async (filePath) => {
  const data = await parseCSV(filePath);

  const validProducts = [];
  const errors = [];

  const existingProducts = await Product.find({}, { sku: 1 });
  const existingSkuSet = new Set(existingProducts.map((p) => p.sku));

  const csvSkuSet = new Set();

  for (let i = 0; i < data.length; i++) {
    const item = data[i];

    const product = {
      title: item.title?.trim() || item.name?.trim(),
      sku: item.sku?.trim(),
      price: item.price,
      category: item.category?.trim(),
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
        row: i + 2,
        message: result.errors,
      });
      continue;
    }

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

    const price = toNumber(product.price, NaN);
    const variantPrice = toNumber(product.variants[0].price, NaN);
    const quantity = toNumber(product.variants[0].quantity, NaN);

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

  return {
    message: "CSV processed",
    total: data.length,
    saved: validProducts.length,
    failed: errors.length,
    errors,
  };
};
