import { useState } from "react"
import { ProductsContext } from "../context/ProductsContext.js"
import ProductsList from "../components/ProductList.jsx";

function App() {
    const [products, setProducts] = useState([
        {
            id: 101,
            name: "Wireless Mouse",
            price: 799,
            category: "Electronics",
            description: "Ergonomic wireless mouse with adjustable DPI.",
            stockQuantity: 25
        },
        {
            id: 102,
            name: "Mechanical Keyboard",
            price: 2499,
            category: "Electronics",
            description: "RGB mechanical keyboard with blue switches.",
            stockQuantity: 12
        },
        {
            id: 103,
            name: "Notebook",
            price: 120,
            category: "Stationery",
            description: "200-page ruled notebook for everyday writing.",
            stockQuantity: 80
        }
    ]);

    return (
        <ProductsContext value={products}>
            <ProductsList></ProductsList>
        </ProductsContext>
    );
}

export default App;
