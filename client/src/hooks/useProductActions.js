import { useProducts } from "../context/ProductsContext.jsx";

import addProductService from "../services/addProductService.js";
import updateProductService from "../services/updateProductService.js";
import deleteProductService from "../services/deleteProductService.js";

function useProductActions() {
    const { products, setProducts } = useProducts();

    async function saveProduct(product) {
        // Updates the existing product
        if (product.id) {
            try {
                const updatedProduct = await updateProductService(product);
                setProducts(products.map(p => {
                    return (p.id != updatedProduct.id) ? p : updatedProduct;
                }));
            }
            catch (e) {
                if (e instanceof TypeError || e instanceof SyntaxError) {
                    e.name = '';
                    e.message = 'Something went wrong!';
                }
                return Promise.reject(e);
            }
        }
        // Adds the new product
        else {
            try {
                const newProduct = await addProductService(product);
                setProducts([...products, newProduct]);
            }
            catch (e) {
                if (e instanceof TypeError || e instanceof SyntaxError) {
                    e.name = '';
                    e.message = 'Something went wrong!';
                }
                return Promise.reject(e);
            }
        }
    }

    async function deleteProduct(id) {
        try {
            await deleteProductService(id);
            setProducts(prev => prev.filter(p => p.id != id));
        }
        catch (e) {
            if (e instanceof TypeError || e instanceof SyntaxError) {
                e.name = '';
                e.message = 'Something went wrong!';
            }
            return Promise.reject(e);
        }
    }

    return { deleteProduct, saveProduct };
}

export default useProductActions;