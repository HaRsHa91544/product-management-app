import { useState } from "react";
import useProductActions from "../hooks/useProductActions.js";
import '../styles/product-actions.css';
import disableButton from "../utils/disableButton.js";
import { useProductForm } from "../context/ProductFormContext.jsx";
import enableButton from "../utils/enableButton.js";

function ProductActions({ product, setSelectedProductId = null }) {
    const { deleteProduct } = useProductActions();

    const { setProductForm, setFormOpened } = useProductForm();

    const [isDeleteBtnClicked, setIsDeleteBtnClicked] = useState(false);

    const [deleteError, setDeleteError] = useState('');

    const { id } = product;


    const handleProductSelect = () => {
        setSelectedProductId(id);
    };

    const editProduct = (product) => {
        setProductForm(product);
        setFormOpened(true);
    }

    const productDeleteHandler = (e) => {
        disableButton(e.target);
        deleteProduct(id).catch(error => {
            setDeleteError(error.message);
            enableButton(e.target);
        });
    };

    const handleDeleteBtnClick = () => {
        setIsDeleteBtnClicked(true);
    };

    const handleDeleteBtnReset = () => {
        setIsDeleteBtnClicked(false);
        setDeleteError('');
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
                    onClick={handleDeleteBtnReset}>No
                </button>
            </div>
            {deleteError && <span className="input-error">{deleteError}</span>}
        </div>;


    return <div className="product-actions">
        {
            (setSelectedProductId) &&
            <button
                className="action-positive-btn"
                onClick={handleProductSelect}>
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
            onClick={handleDeleteBtnClick}>
            Delete
        </button>
    </div>;
}

export default ProductActions;