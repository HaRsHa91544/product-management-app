import { createContext, useContext, useMemo, useState } from "react";

const ProductFormOpenContext = createContext(false);

export function ProductFormOpenProvider({ children }) {
    const [formOpened, setFormOpened] = useState(false);

    const productFormOpenContextValue = useMemo(() => {
        return { formOpened, setFormOpened };
    }, [formOpened]);
    
    return <ProductFormOpenContext value={productFormOpenContextValue}>
        {children}
    </ProductFormOpenContext>;
}

export function useProductFormOpen() {
    return useContext(ProductFormOpenContext);
}