require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const logRoutes = require("./routes/log.routes");

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// routes
app.get("/", (req, res) => {
  res.json({
    message: "Product API is running 🚀",
    version: "1.0.0",
  });
});

app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/logs", logRoutes);

// global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

module.exports = app;
