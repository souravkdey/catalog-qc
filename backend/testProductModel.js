require("dotenv").config(); // Load environment variables from .env

const mongoose = require("mongoose");
const Product = require("./models/Product"); // Import Product model

async function runTests() {
  try {
    // Connect to the same DB your app uses
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to DB");

    // Clear collection so tests are repeatable
    await Product.deleteMany({});

    // Valid product (should succeed)
    const validProduct = await Product.create({
      sku: "SKU123",
      title: "Test Product",
      variants: [
        { name: "Small", price: 10, quantity: 5 },
        { name: "Large", price: 15, quantity: 3 },
      ],
      status: "draft",
    });

    console.log("✅ Valid product saved:", validProduct.sku);

    // Empty variants (should fail)
    try {
      await Product.create({
        sku: "SKU124",
        title: "No Variants Product",
        variants: [],
      });
    } catch {
      console.log("✅ Empty variants rejected");
    }

    // Duplicate variant names (should fail)
    try {
      await Product.create({
        sku: "SKU125",
        title: "Duplicate Variants",
        variants: [
          { name: "Medium", price: 20, quantity: 4 },
          { name: "medium", price: 25, quantity: 2 },
        ],
      });
    } catch {
      console.log("✅ Duplicate variants rejected");
    }

    // Negative price (should fail)
    try {
      await Product.create({
        sku: "SKU126",
        title: "Negative Price",
        variants: [{ name: "XL", price: -5, quantity: 1 }],
      });
    } catch {
      console.log("✅ Negative price rejected");
    }

    // Invalid status (should fail)
    try {
      await Product.create({
        sku: "SKU127",
        title: "Invalid Status",
        variants: [{ name: "One Size", price: 10, quantity: 1 }],
        status: "published",
      });
    } catch {
      console.log("✅ Invalid status rejected");
    }

    await mongoose.disconnect(); // Close DB connection
    console.log("All tests completed");
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

runTests();
