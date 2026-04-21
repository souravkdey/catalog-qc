import axios from "axios";
import { useEffect, useState } from "react";
import AddProductForm from "./AddProductForm";
import ProductCard from "./ProductCard";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [flash, setFlash] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user] = useState({ username: "admin", role: "user" });

  // ✅ Safe filtering
  const filteredProducts = Array.isArray(products)
    ? products.filter((product) => {
        const derivedStatus =
          product.quantity > 0 ? "in-stock" : "out-of-stock";

        const normalizedSearch = searchTerm.trim().toLowerCase();

        const searchMatches =
          product.title.toLowerCase().includes(normalizedSearch) ||
          product.sku.toLowerCase().includes(normalizedSearch);

        const statusMatches =
          selectedStatus === "all" || derivedStatus === selectedStatus;

        return searchMatches && statusMatches;
      })
    : [];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:3001/products");

        console.log("GET /products response:", res.data);

        // ✅ Handle different API shapes safely
        const productArray = Array.isArray(res.data)
          ? res.data
          : res.data.products || res.data.data || [];

        console.log("Final products array:", productArray);

        setProducts(productArray);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
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

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by title or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-1"
        />

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="border p-1"
        >
          <option value="all">All</option>
          <option value="in-stock">In Stock</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>
      </div>

      <h2 className="text-xl font-bold mb-2">Product List</h2>

      {user.role === "admin" && <AddProductForm onAdd={handleAddProduct} />}

      {filteredProducts.length === 0 ? (
        <p>No products found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              isAdmin={user.role === "admin"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
