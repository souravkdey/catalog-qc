const validateProduct = (product) => {
  const errors = [];

  if (!product || typeof product !== "object") {
    return { isValid: false, errors: ["Product must be a valid object"] };
  }

  const { name, price, sku } = product;

  // Validate name
  if (!name || typeof name !== "string" || name.trim() === "") {
    errors.push("Name is required and must be a non-empty string");
  }

  // Validate price
  if (price === undefined || price === null || price === "") {
    errors.push("Price is required and must be provided");
  } else {
    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice)) {
      errors.push("Price must be a valid number");
    } else if (numericPrice < 0) {
      errors.push("Price cannot be negative");
    }
  }

  // Validate SKU
  if (!sku || typeof sku !== "string" || sku.trim() === "") {
    errors.push("SKU is required and must be a non-empty string");
  }

  return { isValid: errors.length === 0, errors };
};

module.exports = validateProduct;
