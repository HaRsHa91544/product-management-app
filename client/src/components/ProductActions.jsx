import { useState } from "react";
import useProductActions from "../hooks/useProductActions.js";
import '../styles/product-actions.css';
import disableButton from "../utils/disableButton.js";

function ProductActions({ product, setSelectedProductId = null }) {
    const { editProduct, deleteProduct } = useProductActions();

    const [isDeleteBtnClicked, setIsDeleteBtnClicked] = useState(false);

    const [deleteError, setDeleteError] = useState('');

    const { id } = product;

    const productDeleteHandler = (e) => {
        disableButton(e.target);
        deleteProduct(id, setDeleteError);
    };

    if (isDeleteBtnClicked)
        return <div className="delete-confirmation-section">
            <span className="confirmation-msg">Are you sure to delete?</span>
            <div className="product-actions">
                <button
                    className="action-negative-btn"
                    onClick={productDeleteHandler}>
                    Yes
                </button>
                <button
                    className="action-positive-btn"
                    onClick={() => {
                        setIsDeleteBtnClicked(false);
                        setDeleteError('');
                    }}>No
                </button>
            </div>
            {deleteError && <span className="input-error">{deleteError}</span>}
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