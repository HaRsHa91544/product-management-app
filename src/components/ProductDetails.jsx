import ProductActions from "./ProductActions.jsx";
import '../styles/product-details.css';

function ProductDetails({ product, setSelectedProductId }) {
    const { name, price, category, description, stockQuantity } = product;

    return <div className="product-details-container">
        <button
            className="action-positive-btn"
            onClick={() => setSelectedProductId(null)}>
            Back
        </button>
        <h2 className="product-name">{name}</h2>
        <h3 className="product-price">₹{price}</h3>
        <h4 className="product-category">{category}</h4>
        <p className="product-description">{description}</p>
        <h5 className="product-stock-quantity">{stockQuantity} more left!</h5>
        <ProductActions product={product}></ProductActions>
    </div>;
}

export default ProductDetails;