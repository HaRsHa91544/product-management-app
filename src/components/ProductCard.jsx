import ProductActions from "./ProductActions.jsx";

function ProductCard({ product, setSelectedProductId }) {
    const { name, price, category } = product;

    return <li>
        <h2>{name}</h2>
        <h3>₹{price}</h3>
        <h4>{category}</h4>
        <ProductActions
            product={product}
            setSelectedProductId={setSelectedProductId}>
        </ProductActions>
    </li>;
}

export default ProductCard;