import { createRoot } from "react-dom/client";
import ProductList from "./components/ProductList";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<ProductList />);
