const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// In-memory database
let products = [{ id: 1, title: "abc", sku: "SKU001", quantity: 20 }];
let nextId = 2;

// Helpers
const validateProduct = (data) => {
  return (
    typeof data.title === "string" &&
    data.title.trim() !== "" &&
    typeof data.sku === "string" &&
    data.sku.trim() !== "" &&
    typeof data.quantity === "number" &&
    data.quantity >= 0
  );
};

const validateId = (id) => {
  return Number.isInteger(id) && id > 0;
};

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Product API is running 🚀",
    version: "1.0.0",
    endpoints: {
      getAll: "GET /products",
      getOne: "GET /products/:id",
      create: "POST /products",
      update: "PUT /products/:id",
      delete: "DELETE /products/:id",
    },
  });
});

// GET all (pagination)
app.get("/products", (req, res) => {
  let { page = 1, limit = 10 } = req.query;

  page = parseInt(page, 10);
  limit = parseInt(limit, 10);

  if (!validateId(page) || !validateId(limit)) {
    return res.status(400).json({ message: "Invalid pagination values" });
  }

  const start = (page - 1) * limit;

  res.json({
    total: products.length,
    page,
    limit,
    data: products.slice(start, start + limit),
  });
});

// GET by ID
app.get("/products/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (!validateId(id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  const product = products.find((p) => p.id === id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.json(product);
});

// POST create
app.post("/products", (req, res) => {
  if (!validateProduct(req.body)) {
    return res.status(400).json({ message: "Invalid product data" });
  }

  const sku = req.body.sku.trim();

  if (products.find((p) => p.sku === sku)) {
    return res.status(409).json({ message: "SKU already exists" });
  }

  const newProduct = {
    id: nextId++,
    title: req.body.title.trim(),
    sku,
    quantity: req.body.quantity,
  };

  products.push(newProduct);

  res.status(201).json(newProduct);
});

// PUT update
app.put("/products/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (!validateId(id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  const product = products.find((p) => p.id === id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  if (!validateProduct(req.body)) {
    return res.status(400).json({ message: "Invalid product data" });
  }

  const sku = req.body.sku.trim();

  if (products.find((p) => p.sku === sku && p.id !== id)) {
    return res.status(409).json({ message: "SKU already exists" });
  }

  product.title = req.body.title.trim();
  product.sku = sku;
  product.quantity = req.body.quantity;

  res.json(product);
});

// DELETE
app.delete("/products/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (!validateId(id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  const index = products.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Product not found" });
  }

  const removed = products.splice(index, 1);

  res.json({
    message: "Product deleted",
    product: removed[0],
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
