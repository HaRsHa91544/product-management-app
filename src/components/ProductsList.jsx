import { memo } from "react";
import ProductCard from "./ProductCard.jsx";
import '../styles/products-list.css';

function ProductsList({ products, validationError, setSelectedProductId }) {
    return <section className="products-list-section">
        <h2 className="products-list-heading">Products List</h2>
        {
            validationError && <h3 className="products-list-validation">
                {validationError}
            </h3>
        }

        {
            products.length > 0 &&
            <ul className="products-list">
                {
                    products.map(product => (
                        <ProductCard
                            setSelectedProductId={setSelectedProductId}
                            key={product.id} product={product}
                        />)
                    )
                }
            </ul>
        }
    </section >;
}

export default memo(ProductsList);