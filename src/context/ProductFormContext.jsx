import { createContext, useContext, useMemo, useState } from "react";

const ProductFormContext = createContext({});

export function ProductFormProvider({ children }) {
    const [productForm, setProductForm] = useState({
        id: 0,
        name: '',
        price: 0,
        category: '',
        description: '',
        stockQuantity: 0,
        isExists: false
    });

    const productFormContextValue = useMemo(() => {
        return { productForm, setProductForm };
    }, [productForm]);

    return <ProductFormContext value={productFormContextValue}>
        {children}
    </ProductFormContext>;
}

export function useProductForm() {
    return useContext(ProductFormContext);
}