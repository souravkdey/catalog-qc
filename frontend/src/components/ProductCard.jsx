import { useState } from "react";

export default function ProductCard({ product, onEdit, onDelete }) {
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState(product.title);
  const [editQuantity, setEditQuantity] = useState(product.quantity);
  const [editSku, setEditSku] = useState(product.sku);

  const isOutOfStock = editQuantity === 0;

  const handleSave = () => {
    onEdit({
      id: product.id,
      title: editTitle,
      quantity: editQuantity,
      sku: editSku,
    });
    setEditMode(false);
  };

  return (
    <div
      className={`rounded p-4 shadow-md ${isOutOfStock ? "opacity-50" : ""}`}
    >
      {editMode ? (
        <>
          <input
            type="text"
            value={editSku}
            onChange={(e) => setEditSku(e.target.value)}
            className="border p-1 mb-1 w-full"
          />
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="border p-1 mb-1 w-full"
          />
          <input
            type="number"
            min={0}
            value={editQuantity}
            onChange={(e) => setEditQuantity(Number(e.target.value))}
            className="border p-1 mb-2 w-full"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="bg-blue-500 text-white px-2 py-1 rounded"
            >
              Save
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="bg-gray-300 px-2 py-1 rounded"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <h3>{product.title}</h3>
          <p>
            <strong>SKU:</strong> {product.sku}
          </p>
          <p>
            <strong>Quantity:</strong>{" "}
            {isOutOfStock ? "Out of Stock" : editQuantity}
          </p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setEditMode(true)}
              className="bg-yellow-300 px-2 py-1 rounded"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(product.id)}
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}
