import { useProducts } from "../context/ProductsContext.jsx";
import { useProductForm } from "../context/ProductFormContext.jsx";

import addProductService from "../services/addProductService.js";
import updateProductService from "../services/updateProductService.js";
import deleteProductService from "../services/deleteProductService.js";

function useProductActions() {
    const { products, setProducts } = useProducts();

    const {
        setProductForm,
        setFormOpened
    } = useProductForm();

    async function saveProduct(product) {
        // Updates the existing product
        if (product.isExists) {
            try {
                const updatedProduct = await updateProductService(product);
                setProducts(products.map(p => {
                    return (p.id != updatedProduct.id) ? p : updatedProduct;
                }));
            }
            catch (e) {
                return Promise.reject(e.cause);
            }
        }
        // Adds the new product
        else {
            try {
                const newProduct = await addProductService(product);
                setProducts([...products, newProduct]);
            }
            catch (e) {
                return Promise.reject(e.cause);
            }
        }
    }

    async function deleteProduct(id, setDeleteError) {
        try {
            await deleteProductService(id);
            setProducts(prev => prev.filter(p => p.id != id));
        }
        catch (e) {
            setDeleteError(e.message);
        }
    }

    function editProduct(product) {
        setProductForm(product);
        setFormOpened(true);
    }

    return { editProduct, deleteProduct, saveProduct };
}

export default useProductActions;