const express = require("express");
const cors = require("cors");
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const products = [
  {
    id: 1,
    title: "abc",
    sku: "SKU001",
    quantity: 20,
  },
];

let nextId = 2;

// GET all products
app.get("/products", (req, res) => {
  res.json(products);
});

// POST a new product
app.post("/products", (req, res) => {
  const newProduct = req.body;

  if (
    typeof newProduct.title !== "string" ||
    newProduct.title.trim() === "" ||
    typeof newProduct.quantity !== "number" ||
    newProduct.quantity < 0 ||
    typeof newProduct.sku !== "string" ||
    newProduct.sku.trim() === ""
  ) {
    return res.status(400).json({ message: "Invalid product data" });
  }

  newProduct.id = nextId++;
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// PUT (edit) an existing product
app.put("/products/:id", (req, res) => {
  const productId = parseInt(req.params.id);
  const updatedData = req.body;

  const product = products.find((p) => p.id === productId);
  if (!product) return res.status(404).json({ message: "Product not found" });

  if (
    typeof updatedData.title !== "string" ||
    updatedData.title.trim() === "" ||
    typeof updatedData.quantity !== "number" ||
    updatedData.quantity < 0 ||
    typeof updatedData.sku !== "string" ||
    updatedData.sku.trim() === ""
  ) {
    return res.status(400).json({ message: "Invalid product data" });
  }

  product.title = updatedData.title;
  product.quantity = updatedData.quantity;
  product.sku = updatedData.sku;

  res.json(product);
});

// DELETE a product
app.delete("/products/:id", (req, res) => {
  const productId = parseInt(req.params.id);
  const index = products.findIndex((p) => p.id === productId);

  if (index === -1)
    return res.status(404).json({ message: "Product not found" });

  const removed = products.splice(index, 1);
  res.json({ message: "Product deleted", product: removed[0] });
});

app.listen(port, () => console.log(`Server running on port ${port}`));
