function ProductCard({ title, sku, quantity }) {
  return (
    <div style={{ border: "1px solid #ccc", padding: "16px", width: "250px" }}>
      <h3>{title}</h3>
      <p>
        <strong>SKU:</strong> {sku}
      </p>
      <p>
        <strong>Quantity:</strong> {quantity}
      </p>
    </div>
  );
}

export default ProductCard;
