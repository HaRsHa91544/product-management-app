function ProductCard({ product }) {
    const { id, name, price, category, description, stockQuantity } = product;
    return <li>
        <h2>{name}</h2>
        <h3>₹{price}</h3>
        <h4>{category}</h4>
        <p>{description}</p>
        <h5>{stockQuantity} more left!</h5>
    </li>;
}

export default ProductCard;