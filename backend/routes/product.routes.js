const express = require("express");

const authenticate = require("../middleware/auth");
const upload = require("../middleware/uploadMiddleware");

const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadCSV,
  exportErrorsJSON,
} = require("../controllers/product.controller");

const router = express.Router();

// public route
router.get("/", getProducts);

// protected routes
router.post("/", authenticate, createProduct);
router.put("/:id", authenticate, updateProduct);
router.delete("/:id", authenticate, deleteProduct);

// csv upload route
router.post("/upload", authenticate, upload.single("file"), uploadCSV);

// export last import errors
router.get("/errors/export/json", authenticate, exportErrorsJSON);

module.exports = router;
