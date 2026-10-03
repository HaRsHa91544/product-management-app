import { useState } from "react";
import useProductActions from "../hooks/useProductActions.js";

function ProductDetails({ product, setSelectedProductId }) {
    const { editProduct, deleteProduct } = useProductActions();

    const [isDeleteBtnClicked, setIsDeleteBtnClicked] = useState(false);

    const { id, name, price, category, description, stockQuantity } = product;

    return <div>
        <button onClick={() => setSelectedProductId(null)}>Back to Products</button>
        <h2>{name}</h2>
        <h3>₹{price}</h3>
        <h4>{category}</h4>
        <p>{description}</p>
        <h5>{stockQuantity} more left!</h5>
        {
            isDeleteBtnClicked ?
                <div>
                    <p>Are you sure to delete?</p>
                    <button onClick={() => deleteProduct(id)}>Yes</button>
                    <button onClick={() => setIsDeleteBtnClicked(false)}>No</button>
                </div>
                :
                <>
                    <button onClick={() => editProduct(product)}>Edit</button>
                    <button onClick={() => setIsDeleteBtnClicked(true)}>Delete</button>
                </>
        }
    </div>;
}

export default ProductDetails;