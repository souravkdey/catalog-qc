const express = require("express");
const authenticate = require("../middleware/auth");
const upload = require("../middleware/uploadMiddleware");

const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadCSV,
} = require("../controllers/product.controller");

const router = express.Router();

// Product routes
router.get("/", getProducts);
router.post("/", authenticate, createProduct);
router.put("/:id", authenticate, updateProduct);
router.delete("/:id", authenticate, deleteProduct);

// CSV upload route
router.post("/upload", authenticate, upload.single("file"), uploadCSV);

module.exports = router;
