import { useState } from "react";

export default function AddProductForm({ onAdd }) {
  const [sku, setSku] = useState("");
  const [title, setTitle] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!sku.trim()) return setError("SKU is required");
    if (!title.trim()) return setError("Title is required");
    if (quantity < 0) return setError("Quantity cannot be negative");

    onAdd({ sku, title, quantity });
    setSku("");
    setTitle("");
    setQuantity(0);
    setError("");
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 flex flex-col gap-2">
      {error && <p className="text-red-600">{error}</p>}
      <input
        placeholder="SKU"
        value={sku}
        onChange={(e) => setSku(e.target.value)}
        className="border p-1"
      />
      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-1"
      />
      <input
        type="number"
        min={0}
        placeholder="Quantity"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        className="border p-1"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-2 py-1 rounded"
      >
        Add Product
      </button>
    </form>
  );
}
