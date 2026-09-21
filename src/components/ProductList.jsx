import { useContext } from "react";
import { ProductsContext } from "../context/ProductsContext.js";
import ProductCard from "./ProductCard.jsx";

function ProductsList() {
    const { products } = useContext(ProductsContext);

    return <section>
        <h1>Products List</h1>

        {
            products.length === 0 &&
            <h3>No products found!</h3>
        }

        {
            products.length > 0 &&
            <ul>
                {
                    products.map(product => <ProductCard key={product.id} product={product} />)
                }
            </ul>
        }
    </section>;
}

export default ProductsList;