import { useState } from "react";
import useProductActions from "../hooks/useProductActions.js";
import '../styles/product-actions.css';

function ProductActions({ product, setSelectedProductId = null }) {
    const { editProduct, deleteProduct } = useProductActions();

    const [isDeleteBtnClicked, setIsDeleteBtnClicked] = useState(false);

    const { id } = product;


    if (isDeleteBtnClicked)
        return <div className="delete-confirmation-section">
            <span className="confirmation-msg">Are you sure to delete?</span>
            <div className="product-actions">
                <button
                    className="action-negative-btn"
                    onClick={() => deleteProduct(id)}>
                    Yes
                </button>
                <button
                    className="action-positive-btn"
                    onClick={() => setIsDeleteBtnClicked(false)}>
                    No
                </button>
            </div>
        </div>;


    return <div className="product-actions">
        {
            (setSelectedProductId) &&
            <button
                className="action-positive-btn"
                onClick={() => setSelectedProductId(id)}>
                View
            </button>
        }
        <button
            className="action-neutral-btn"
            onClick={() => editProduct(product)}>
            Edit
        </button>
        <button
            className="action-negative-btn"
            onClick={() => setIsDeleteBtnClicked(true)}>
            Delete
        </button>
    </div>;
}

export default ProductActions;