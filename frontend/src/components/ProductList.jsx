import axios from "axios";
import { useEffect, useState } from "react";
import AddProductForm from "./AddProductForm";
import ProductCard from "./ProductCard";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [flash, setFlash] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:3001/products")
      .then((res) => setProducts(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const showFlash = (msg) => {
    setFlash(msg);
    setTimeout(() => setFlash(""), 3000);
  };

  const handleAddProduct = async (newProduct) => {
    try {
      const res = await axios.post(
        "http://localhost:3001/products",
        newProduct
      );
      setProducts((prev) => [...prev, res.data]);
      showFlash("Product added successfully");
    } catch (err) {
      showFlash(err.response?.data?.message || "Error adding product");
    }
  };

  const handleEditProduct = async (updatedProduct) => {
    try {
      const res = await axios.put(
        `http://localhost:3001/products/${updatedProduct.id}`,
        updatedProduct
      );
      setProducts((prev) =>
        prev.map((p) => (p.id === res.data.id ? res.data : p))
      );
      showFlash("Product updated successfully");
    } catch (err) {
      showFlash(err.response?.data?.message || "Error updating product");
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showFlash("Product deleted successfully");
    } catch (err) {
      showFlash(err.response?.data?.message || "Error deleting product");
    }
  };

  if (isLoading) return <h2>Loading...</h2>;
  if (error) return <h2>{error}</h2>;

  return (
    <div className="p-4">
      {flash && (
        <div className="bg-green-200 text-green-800 p-2 rounded mb-2">
          {flash}
        </div>
      )}
      <h2 className="text-xl font-bold mb-2">Product List</h2>
      <AddProductForm onAdd={handleAddProduct} />
      {products.length === 0 ? (
        <p>No products found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
}
