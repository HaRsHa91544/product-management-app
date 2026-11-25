import { createContext, useContext, useEffect, useMemo, useState } from "react";
import getProductsService from "../services/getProductsService.js";

const ProductsContext = createContext([]);

export function ProductsProvider({ children }) {
    const [products, setProducts] = useState([]);

    const [stateOfProducts, setStateOfProducts] = useState('Loading...');

    useEffect(() => {
        (async () => {
            try {
                const products = await getProductsService();
                setProducts([...products]);
                setStateOfProducts('success');
            }
            catch (e) {
                if (e instanceof TypeError || e instanceof SyntaxError) {
                    e.name = '';
                    e.message = 'Something went wrong!';
                }
                setStateOfProducts(e.message || 'Failed to load products, try again!');
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