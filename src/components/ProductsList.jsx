import { memo } from "react";
import ProductCard from "./ProductCard.jsx";

function ProductsList({ products, validationError, setSelectedProductId }) {
    return <section>
        <h1>Products List</h1>
        {
            validationError && <h3>{validationError}</h3>
        }

        {
            products.length > 0 &&
            <ul>
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