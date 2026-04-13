import { useState } from "react";

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
    <form onSubmit={handleSubmit} className="mb-4 flex flex-col gap-2">
      {errors.sku && <p className="text-red-600">{errors.sku}</p>}

      <input
        placeholder="SKU"
        value={sku}
        onChange={(e) => setSku(e.target.value)}
        className="border p-1"
      />

      {errors.title && <p className="text-red-600">{errors.title}</p>}

      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-1"
      />

      {errors.quantity && <p className="text-red-600">{errors.quantity}</p>}

      <input
        type="number"
        min={0}
        placeholder="Quantity"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
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
