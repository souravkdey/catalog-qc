const productService = require("../services/product.service");

const handleServerError = (res, error, message = "Unknown Error") => {
  console.error(error);
  res.status(500).json({ message });
};

exports.getProducts = async (req, res) => {
  try {
    const result = await productService.getProducts(req.query);
    res.json(result);
  } catch (error) {
    handleServerError(res, error, "Internal server error");
  }
};

exports.createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);
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
    const updatedProduct = await productService.updateProduct(
      req.params.id,
      req.body
    );

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
    await productService.deleteProduct(req.params.id);
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

    const result = await productService.uploadCSV(req.file.path);

    res.status(201).json(result);
  } catch (error) {
    console.error("CSV UPLOAD ERROR:", error);
    handleServerError(res, error, "CSV upload failed");
  }
};
