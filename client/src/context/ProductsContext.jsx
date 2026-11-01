import { createContext, useContext, useEffect, useMemo, useState } from "react";
import getProducts from "../services/getProducts.js";

const ProductsContext = createContext([]);

export function ProductsProvider({ children }) {
    const [products, setProducts] = useState([]);

    const [stateOfProducts, setStateOfProducts] = useState('Loading...');

    useEffect(() => {
        (async () => {
            try {
                const products = await getProducts();
                setProducts([...products]);
                setStateOfProducts('success');
            }
            catch (error) {
                setStateOfProducts(error.message || 'Failed to load products, try again!');
            }
        })();
    }, []);

    const productsContextValue = useMemo(() => {
        return { products, setProducts, stateOfProducts };
    }, [products, stateOfProducts]);

    return <ProductsContext value={productsContextValue}>
        {children}
    </ProductsContext>;
}

export function useProducts() {
    return useContext(ProductsContext);
}