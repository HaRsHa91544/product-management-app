import { useProducts } from "../context/ProductsContext.jsx";
import { useProductForm } from "../context/ProductFormContext.jsx";
import { useProductFormOpen } from "../context/ProductFormOpenContext.jsx";

function useProductActions() {
    const { products, setProducts } = useProducts();
    const { setProductForm } = useProductForm();
    const { setFormOpened } = useProductFormOpen();
    
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