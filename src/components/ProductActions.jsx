import { useState } from "react";
import useProductActions from "../hooks/useProductActions.js";

function ProductActions({ product, setSelectedProductId = null }) {
    const { editProduct, deleteProduct } = useProductActions();

    const [isDeleteBtnClicked, setIsDeleteBtnClicked] = useState(false);

    const { id } = product;
    
    
    if (isDeleteBtnClicked)
        return <div>
            <p>Are you sure to delete?</p>
            <button onClick={() => deleteProduct(id)}>Yes</button>
            <button onClick={() => setIsDeleteBtnClicked(false)}>No</button>
        </div>;


    return <div>
        {
            (setSelectedProductId) &&
            <button onClick={() => setSelectedProductId(id)}>View Product</button>
        }
        <button onClick={() => editProduct(product)}>Edit</button>
        <button onClick={() => setIsDeleteBtnClicked(true)}>Delete</button>
    </div>;
}

export default ProductActions;