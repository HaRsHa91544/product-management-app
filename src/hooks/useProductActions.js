import { useContext } from "react";
import { ProductsContext } from "../context/ProductsContext.js";
import { ProductFormContext } from "../context/ProductFormContext.js";

function useProductActions() {
    const { products, setProducts } = useContext(ProductsContext);
    const { setProductForm } = useContext(ProductFormContext);

    function saveProduct(product) {
        // Updates the existing product
        if (product.isExists) {
            setProducts(products.map(p => {
                return (p.id != product.id) ? p : product;
            }));
        }
        // Adds the new product
        else {
            product.isExists = true;
            setProducts([...products, product]);
        }
    }

    function deleteProduct(id) {
        setProducts(prev => prev.filter(p => p.id != id));
    }

    function editProduct(product) {
        setProductForm(product);
    }

    return { editProduct, deleteProduct, saveProduct };
}

export default useProductActions;