import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import ProductFormPage from "./pages/ProductForm";
import ProductListPage from "./pages/ProductList";

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/products">Product List</Link>
        <Link to="/products/new">Add Product</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/products" element={<ProductListPage />}></Route>
        <Route path="/products/new" element={<ProductFormPage />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
