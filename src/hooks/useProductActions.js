import { useContext, useState } from "react";
import { ProductsContext } from "../context/ProductsContext.js";
import { ProductFormContext } from "../context/ProductFormContext.js";

function useProductActions() {
    const [isDeleteBtnClicked, setIsDeleteBtnClicked] = useState(false);

    const { setProducts } = useContext(ProductsContext);
    const { setProductForm } = useContext(ProductFormContext);

    function deleteProduct(id) {
        setProducts(prev => prev.filter(p => p.id != id));
    }

    function editProduct(product) {
        setProductForm(product);
    }

    return { editProduct, deleteProduct, isDeleteBtnClicked, setIsDeleteBtnClicked };
}

export default useProductActions;