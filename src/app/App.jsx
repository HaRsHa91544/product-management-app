import { useMemo, useState } from "react";
import { ProductsContext } from "../context/ProductsContext.js";
import { ProductFormContext } from "../context/ProductFormContext.js";
import ProductForm from "../components/ProductForm.jsx";
import ProductsView from "../components/ProductsView.jsx";

function App() {
    const [products, setProducts] = useState([
        {
            id: 101,
            name: "Wireless Mouse",
            price: 799,
            category: "Electronics",
            description: "Ergonomic wireless mouse with adjustable DPI.",
            stockQuantity: 25,
            isExists: true
        },
        {
            id: 102,
            name: "Mechanical Keyboard",
            price: 2499,
            category: "Electronics",
            description: "RGB mechanical keyboard with blue switches.",
            stockQuantity: 12,
            isExists: true
        },
        {
            id: 103,
            name: "Notebook",
            price: 120,
            category: "Stationery",
            description: "200-page ruled notebook for everyday writing.",
            stockQuantity: 80,
            isExists: true
        }
    ]);

    const [productForm, setProductForm] = useState({
        id: 0,
        name: '',
        price: 0,
        category: '',
        description: '',
        stockQuantity: 0,
        isExists: false
    });

    const productsContextValue = useMemo(() => {
        return { products, setProducts };
    }, [products]);

    const productFormContextValue = useMemo(() => {
        return { productForm, setProductForm };
    }, [productForm]);

    return (
        <ProductsContext value={productsContextValue}>
            <ProductFormContext value={productFormContextValue}>
                <ProductForm></ProductForm>
                <ProductsView></ProductsView>
            </ProductFormContext>
        </ProductsContext>
    );
}

export default App;
