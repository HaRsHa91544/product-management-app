import { useContext } from "react";
import { ProductsContext } from "../context/ProductsContext.js";
import { ProductFormContext } from "../context/ProductFormContext.js";
import { ProductFormOpenContext } from "../context/ProductFormOpenContext.js";

function useProductActions() {
    const { products, setProducts } = useContext(ProductsContext);
    const { setProductForm } = useContext(ProductFormContext);
    const { setFormOpened } = useContext(ProductFormOpenContext);

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
        setFormOpened(false);
    }

    function deleteProduct(id) {
        setProducts(prev => prev.filter(p => p.id != id));
    }

    function editProduct(product) {
        setProductForm(product);
        setFormOpened(true);
    }

    return { editProduct, deleteProduct, saveProduct };
}

export default useProductActions;