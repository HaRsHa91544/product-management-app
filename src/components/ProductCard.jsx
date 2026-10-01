import useProductActions from "../hooks/useProductActions.js";

function ProductCard({ product, setSelectedProductId }) {
    const { isDeleteBtnClicked, setIsDeleteBtnClicked, editProduct, deleteProduct } = useProductActions();

    const { id, name, price, category } = product;

    return <li>
        <h2>{name}</h2>
        <h3>₹{price}</h3>
        <h4>{category}</h4>
        {
            isDeleteBtnClicked ?
                <div>
                    <p>Are you sure to delete?</p>
                    <button onClick={() => deleteProduct(id)}>Yes</button>
                    <button onClick={() => setIsDeleteBtnClicked(false)}>No</button>
                </div>
                :
                <>

                    <button onClick={() => setSelectedProductId(id)}>View Product</button>
                    <button onClick={() => editProduct(product)}>Edit</button>
                    <button onClick={() => setIsDeleteBtnClicked(true)}>Delete</button>
                </>
        }
    </li>;
}

export default ProductCard;