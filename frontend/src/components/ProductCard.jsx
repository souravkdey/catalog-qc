import { useEffect, useState } from "react";
import "./ProductCard.css";

export default function ProductCard({ product, onEdit, onDelete, isAdmin }) {
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState(product.title);
  const [editQuantity, setEditQuantity] = useState(product.quantity);
  const [editSku, setEditSku] = useState(product.sku);

  const isOutOfStock = product.quantity === 0;

  // Sync local state if product changes externally
  useEffect(() => {
    setEditTitle(product.title);
    setEditQuantity(product.quantity);
    setEditSku(product.sku);
  }, [product]);

  const handleSave = () => {
    const trimmedTitle = editTitle.trim();
    const trimmedSku = editSku.trim();
    const numericQuantity = Number(editQuantity);

    if (!trimmedTitle || !trimmedSku || numericQuantity < 0) {
      return;
    }

    onEdit({
      id: product.id,
      title: trimmedTitle,
      quantity: numericQuantity,
      sku: trimmedSku,
    });

    setEditMode(false);
  };

  return (
    <div className={`product-card ${isOutOfStock ? "out-of-stock" : ""}`}>
      {editMode ? (
        <>
          <div className="card-content">
            <input
              type="text"
              value={editSku}
              onChange={(e) => setEditSku(e.target.value)}
              className="input"
            />

            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="input"
            />

            <input
              type="number"
              min={0}
              value={editQuantity}
              onChange={(e) => setEditQuantity(e.target.value)}
              className="input"
            />
          </div>

          <div className="card-actions">
            <button onClick={handleSave} className="btn btn-primary">
              Save
            </button>

            <button
              onClick={() => setEditMode(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="card-content">
            <h3 className="card-title">{product.title}</h3>

            <p className="card-text">
              <strong>SKU:</strong> {product.sku}
            </p>

            <p className="card-text">
              <strong>Quantity:</strong>{" "}
              {isOutOfStock ? "Out of Stock" : product.quantity}
            </p>
          </div>

          {isAdmin && (
            <div className="card-actions">
              <button
                onClick={() => setEditMode(true)}
                className="btn btn-edit"
              >
                Edit
              </button>

              <button
                onClick={() => onDelete(product.id)}
                className="btn btn-delete"
              >
                Delete
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
