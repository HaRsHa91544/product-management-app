import { useProducts } from "../context/ProductsContext.jsx";
import { useProductForm } from "../context/ProductFormContext.jsx";
import { useProductFormOpen } from "../context/ProductFormOpenContext.jsx";
import addProductService from "../services/addProductService.js";
import updateProductService from "../services/updateProductService.js";

function useProductActions() {
    const { products, setProducts } = useProducts();
    const { setProductForm, setProductSubmitError } = useProductForm();
    const { setFormOpened } = useProductFormOpen();

    async function saveProduct(product) {
        // Updates the existing product
        if (product.isExists) {
            try {
                const updatedProduct = await updateProductService(product);
                setProducts(products.map(p => {
                    return (p.id != updatedProduct.id) ? p : updatedProduct;
                }));
                setFormOpened(false);
            }
            catch (e) {
                setProductSubmitError(e.message);
            }
        }
        // Adds the new product
        else {
            product.isExists = true;
            try {
                const newProduct = await addProductService(product);
                setProducts([...products, newProduct]);
                setFormOpened(false);
            }
            catch (e) {
                setProductSubmitError(e.message);
            }
        }
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