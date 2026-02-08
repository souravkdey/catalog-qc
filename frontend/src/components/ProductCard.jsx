import { useState } from "react";

function ProductCard({ product }) {
  const { title, sku, quantity } = product;
  const [stock, setStock] = useState(quantity);

  const isOutOfStock = stock === 0;

  const cardClasses = `
  rounded-sm p-4 w-48 shadow-md
  hover:shadow-lg transition duration-300 shadow-xl/20
  ${isOutOfStock ? "opacity-50" : ""}
`;

  return (
    <div className={cardClasses}>
      <h3>{title}</h3>

      <p>
        <strong>SKU:</strong> {sku}
      </p>

      <p>
        {isOutOfStock ? (
          "Out Of Stock"
        ) : (
          <>
            <strong>Quantity:</strong> {stock}
          </>
        )}
      </p>

      <button onClick={() => setStock(stock + 1)}>+</button>

      <button disabled={isOutOfStock} onClick={() => setStock(stock - 1)}>
        -
      </button>
    </div>
  );
}

export default ProductCard;
