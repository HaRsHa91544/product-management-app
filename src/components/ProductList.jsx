import { useContext, useState } from "react";
import { ProductsContext } from "../context/ProductsContext.js";
import ProductCard from "./ProductCard.jsx";
import SearchBar from "./SearchBar.jsx";

function ProductsList() {
    const { products } = useContext(ProductsContext);

    const [searchValue, setSearchValue] = useState('');

    let searchedProducts;
    if (searchValue) {
        searchedProducts = products.filter(p => p.name.toLowerCase().includes(searchValue.toLowerCase()))
    }
    else {
        searchedProducts = products;
    }

    return <section>
        <h1>Products List</h1>

        <SearchBar searchValue={searchValue} setSearchValue={setSearchValue}></SearchBar>

        {
            searchedProducts.length === 0 &&
            <h3>No products found!</h3>
        }

        {
            searchedProducts.length > 0 &&
            <ul>
                {
                    searchedProducts.map(product => <ProductCard key={product.id} product={product} />)
                }
            </ul>
        }
    </section>;
}

export default ProductsList;