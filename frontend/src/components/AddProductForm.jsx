import { useState } from "react";
import "./AddProductForm.css";

export default function AddProductForm({ onAdd }) {
  const [sku, setSku] = useState("");
  const [title, setTitle] = useState("");
  const [quantity, setQuantity] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();

    setErrors({});

    const trimmedSku = sku.trim();
    const trimmedTitle = title.trim();
    const numericQuantity = Number(quantity);

    if (!trimmedSku) {
      return setErrors({ sku: "SKU is required" });
    }

    if (!trimmedTitle) {
      return setErrors({ title: "Title is required" });
    }

    if (numericQuantity < 0 || Number.isNaN(numericQuantity)) {
      return setErrors({
        quantity: "Quantity must be 0 or greater",
      });
    }

    onAdd({
      sku: trimmedSku,
      title: trimmedTitle,
      quantity: numericQuantity,
    });

    setSku("");
    setTitle("");
    setQuantity("");
    setErrors({});
  };

  return (
    <div className="form-card">
      <h3 className="form-title">Add Product</h3>

      <form onSubmit={handleSubmit} className="form">
        {/* SKU */}
        <div className="form-group">
          {errors.sku && <p className="form-error">{errors.sku}</p>}
          <input
            placeholder="SKU"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="input"
          />
        </div>

        {/* Title */}
        <div className="form-group">
          {errors.title && <p className="form-error">{errors.title}</p>}
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
          />
        </div>

        {/* Quantity */}
        <div className="form-group">
          {errors.quantity && <p className="form-error">{errors.quantity}</p>}
          <input
            type="number"
            min={0}
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="input"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Add Product
          </button>
        </div>
      </form>
    </div>
  );
}
