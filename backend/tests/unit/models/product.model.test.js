const Product = require("../../../models/Product");

describe("Product Model", () => {
  beforeEach(async () => {
    await Product.deleteMany({});
  });

  test("creates valid product", async () => {
    const product = await Product.create({
      sku: "SKU123",
      title: "Test Product",
      variants: [
        { name: "Small", price: 10, quantity: 5 },
        { name: "Large", price: 15, quantity: 3 },
      ],
      status: "draft",
    });

    expect(product.sku).toBe("SKU123");
  });

  test("rejects empty variants", async () => {
    await expect(
      Product.create({
        sku: "SKU124",
        title: "No Variants",
        variants: [],
      })
    ).rejects.toThrow();
  });

  test("rejects negative price", async () => {
    await expect(
      Product.create({
        sku: "SKU125",
        title: "Negative Price",
        variants: [{ name: "XL", price: -5, quantity: 1 }],
      })
    ).rejects.toThrow();
  });
});
