import { useContext, useState } from "react";
import { ProductsContext } from "../context/ProductsContext.js";
import { ProductFormContext } from "../context/ProductFormContext.js";

function ProductCard({ product = null, setSelectedProductId, selectedProductId = 0 }) {
    const { products, setProducts } = useContext(ProductsContext);
    const { setProductForm } = useContext(ProductFormContext);

    if (!product) {
        product = products.find(p => p.id == selectedProductId);
        if (!product) {
            setSelectedProductId(0);
            return;
        }
    }

    const [isDeleteBtnClicked, setIsDeleteBtnClicked] = useState(false);

    function deleteProduct(id) {
        setProducts(prev => prev.filter(p => p.id != id));
    }

    function editProduct(product) {
        setProductForm(product);
    }

    const { id, name, price, category, description, stockQuantity } = product;

    return <li>
        <h2>{name}</h2>
        <h3>₹{price}</h3>
        <h4>{category}</h4>
        {
            selectedProductId ?
                <>
                    <p>{description}</p>
                    <h5>{stockQuantity} more left!</h5>
                </>
                :
                ''
        }
        {
            isDeleteBtnClicked ?
                <div>
                    <p>Are you sure to delete?</p>
                    <button onClick={() => deleteProduct(id)}>Yes</button>
                    <button onClick={() => setIsDeleteBtnClicked(false)}>No</button>
                </div>
                :
                <>

                    {!selectedProductId && <button onClick={() => setSelectedProductId(id)}>View Product</button>}
                    <button onClick={() => editProduct(product)}>Edit</button>
                    <button onClick={() => setIsDeleteBtnClicked(true)}>Delete</button>
                </>
        }
    </li>;
}

export default ProductCard;