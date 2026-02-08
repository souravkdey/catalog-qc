import { products } from "../data/products";
import ProductCard from "./ProductCard";

function ProductList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6">
      <h2>Product List</h2>

      {products.length === 0 ? (
        <p>No products found</p>
      ) : (
        products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))
      )}
    </div>
  );
}

export default ProductList;
