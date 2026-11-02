import { createContext, useContext, useMemo, useState } from "react";

const ProductFormContext = createContext({});

export function ProductFormProvider({ children }) {
    const [productForm, setProductForm] = useState({
        name: '',
        price: 0,
        category: '',
        description: '',
        stockQuantity: 0,
        isExists: false
    });

    const [productSubmitError, setProductSubmitError] = useState('');

    const productFormContextValue = useMemo(() => {
        return {
            productForm,
            setProductForm,
            productSubmitError,
            setProductSubmitError
        };
    }, [productForm, productSubmitError]);

    return <ProductFormContext value={productFormContextValue}>
        {children}
    </ProductFormContext>;
}

export function useProductForm() {
    return useContext(ProductFormContext);
}