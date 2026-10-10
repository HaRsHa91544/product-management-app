import ProductActions from "./ProductActions.jsx";

function ProductCard({ product, setSelectedProductId }) {
    const { name, price, category } = product;

    return <li className="product-card">
        <h3 className="product-name">{name}</h3>
        <h4 className="product-price">₹{price}</h4>
        <h5 className="product-category">{category}</h5>
        <ProductActions
            product={product}
            setSelectedProductId={setSelectedProductId}>
        </ProductActions>
    </li>;
}

export default ProductCard;