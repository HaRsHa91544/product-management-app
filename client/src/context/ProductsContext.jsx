import { createContext, useContext, useEffect, useMemo, useState } from "react";
import getProducts from "../services/getProducts.js";

const ProductsContext = createContext([]);

export function ProductsProvider({ children }) {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        (async () => {
            const products = await getProducts();
            setProducts(products);
        })();
    }, []);

    const productsContextValue = useMemo(() => {
        return { products, setProducts };
    }, [products]);

    return <ProductsContext value={productsContextValue}>
        {children}
    </ProductsContext>;
}

export function useProducts() {
    return useContext(ProductsContext);
}