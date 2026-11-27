import { createContext, useContext, useEffect, useMemo, useState } from "react";
import getProductsService from "../services/getProductsService.js";

const ProductsContext = createContext([]);

export function ProductsProvider({ children }) {
    const [products, setProducts] = useState([]);

    const [stateOfProducts, setStateOfProducts] = useState('Loading...');

    const productsContextValue = useMemo(() => {
        return { products, setProducts, stateOfProducts };
    }, [products, stateOfProducts]);


    useEffect(() => {
        (async () => {
            try {
                const products = await getProductsService();
                setProducts([...products]);
                setStateOfProducts('success');
            }
            catch (e) {
                setStateOfProducts('Failed to load products, try again!');
            }
        })();
    }, []);
    

    return <ProductsContext value={productsContextValue}>
        {children}
    </ProductsContext>;
}

export function useProducts() {
    return useContext(ProductsContext);
}