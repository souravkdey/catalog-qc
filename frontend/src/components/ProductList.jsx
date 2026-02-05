import ProductCard from "./ProductCard";

const products = [
  {
    id: 1,
    title: "Wireless Mouse",
    sku: "WM-1023",
    quantity: 25,
  },
  {
    id: 2,
    title: "Mechanical Keyboard",
    sku: "MK-2045",
    quantity: 12,
  },
  {
    id: 3,
    title: "USB-C Cable",
    sku: "UC-7781",
    quantity: 100,
  },
];

function ProductList() {
  return (
    <div>
      <h2>Product List</h2>

      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default ProductList;
