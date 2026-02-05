import { useState } from "react";

function ProductCard({ product }) {
  const { title, sku, quantity } = product;
  const [stock, setStock] = useState(quantity);

  return (
    <div style={{ border: "1px solid #ccc", padding: "16px", width: "250px" }}>
      <h3>{title}</h3>
      <p>
        <strong>SKU:</strong> {sku}
      </p>
      <p>
        <strong>Quantity:</strong> {stock}
      </p>

      <button onClick={() => setStock(stock + 1)}>+</button>
      <button
        disabled={stock === 0}
        onClick={() => {
          if (stock > 0) {
            setStock(stock - 1);
          }
        }}
      >
        -
      </button>
    </div>
  );
}

export default ProductCard;
