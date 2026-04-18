const productService = require("../services/product.service");

let lastImportErrors = [];

// shared 500 error handler
const handleServerError = (res, error, message = "Unknown Error") => {
  console.error(error);
  res.status(500).json({ message });
};

// get products with filters / pagination
exports.getProducts = async (req, res) => {
  try {
    const result = await productService.getProducts(req.query);
    res.json(result);
  } catch (error) {
    handleServerError(res, error, "Internal server error");
  }
};

// create new product
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

// update existing product
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

// delete product
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

// upload and process csv file
exports.uploadCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await productService.uploadCSV(req.file.path);

    // store latest import errors for export route
    lastImportErrors = result.errors || [];

    res.status(201).json(result);
  } catch (error) {
    console.error("CSV UPLOAD ERROR:", error);
    handleServerError(res, error, "CSV upload failed");
  }
};

// export latest qc errors as json
exports.exportErrorsJSON = (req, res) => {
  if (lastImportErrors.length === 0) {
    return res.status(200).json({
      message: "No QC errors available for export yet",
      count: 0,
      errors: [],
    });
  }

  res.status(200).json({
    count: lastImportErrors.length,
    errors: lastImportErrors,
  });
};
