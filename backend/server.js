// env config
require("dotenv").config();

// deps
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const jwt = require("jsonwebtoken");

// internal modules
const connectDB = require("./config/db");
const Product = require("./models/Product");

// app init
const app = express();
const port = process.env.PORT || 3001;

// middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// auth middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // "Bearer <token>"

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user to request
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// root route
app.get("/", (req, res) => {
  res.json({
    message: "Product API is running 🚀",
    version: "1.0.0",
  });
});

// login (temporary hardcoded)
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username !== "admin" || password !== "1234") {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { username: "admin", role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
});

// get products (public paginated)
app.get("/products", async (req, res) => {
  try {
    let { page = "1", limit = "10", status } = req.query;

    // Convert to numbers
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    // Validate numbers
    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      return res.status(400).json({ message: "Invalid pagination values" });
    }

    // Prevent abuse (limit cap)
    limit = Math.min(limit, 50);

    const skip = (page - 1) * limit;

    // Allowed status values
    const allowedStatus = ["active", "inactive"];

    const filter = {};

    if (status && status.trim() !== "") {
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      filter.status = status;
    } else {
      filter.status = "active"; // default
    }

    const data = await Product.find(filter).skip(skip).limit(limit);

    const total = await Product.countDocuments(filter);

    res.json({
      total,
      page,
      limit,
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// create product (protected)
app.post("/products", authenticate, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    return res.status(201).json(product);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "SKU Already Exists" }); // duplicate
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message }); // schema fail
    }

    return res.status(500).json({ message: "Unknown Error" });
  }
});

// update product (protected)
app.put("/products/:id", authenticate, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // return updated + validate
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json(updatedProduct);
  } catch (error) {
    console.log(error.message);

    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    if (error.code === 11000) {
      return res.status(409).json({ message: "SKU Already Exists" });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: "Unknown Error" });
  }
});

// soft delete (protected)
app.delete("/products/:id", authenticate, async (req, res) => {
  try {
    const archivedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { status: "archived" }, // soft delete
      { new: true }
    );

    if (!archivedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    return res.status(500).json({ message: "Unknown Error" });
  }
});

// global error handler (fallback)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// start server after DB connects
const startServer = async () => {
  try {
    await connectDB();

    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
