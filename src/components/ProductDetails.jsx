import ProductActions from "./ProductActions.jsx";

function ProductDetails({ product, setSelectedProductId }) {
    const { name, price, category, description, stockQuantity } = product;

    return <div>
        <button onClick={() => setSelectedProductId(null)}>Back to Products</button>
        <h2>{name}</h2>
        <h3>₹{price}</h3>
        <h4>{category}</h4>
        <p>{description}</p>
        <h5>{stockQuantity} more left!</h5>
        <ProductActions product={product}></ProductActions>
    </div>;
}

export default ProductDetails;