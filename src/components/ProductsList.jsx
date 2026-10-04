import { memo, useContext } from "react";
import { ProductsContext } from "../context/ProductsContext.js";
import ProductCard from "./ProductCard.jsx";
import SearchBar from "./SearchBar.jsx";

function ProductsList({ searchValue, setSearchValue, filterByCategory, setFilterByCategory, setSelectedProductId }) {
    const { products } = useContext(ProductsContext);

    function clearFilterByCategory() {
        setFilterByCategory('');
    }

    
    const categories = Array.from(new Set(products.map(p => p.category)));

    let filteredProducts = products;

    if (filterByCategory) {
        filteredProducts = products.filter(p => p.category == filterByCategory);
    }

    if (searchValue) {
        filteredProducts = filteredProducts
            .filter(p => p.name.toLowerCase().includes(searchValue.toLowerCase()));
    }


    let validationError = '';

    if (products.length === 0)
        validationError = 'No products available';

    else if (filterByCategory && !categories.includes(filterByCategory))
        validationError = 'The selected filter is no longer valid, clear the filter';

    else if (filteredProducts.length === 0 && searchValue)
        validationError = 'No products found for your search';


    return <section>
        <h1>Products List</h1>

        <SearchBar searchValue={searchValue} setSearchValue={setSearchValue}></SearchBar>

        <select
            value={filterByCategory}
            onChange={(e) => setFilterByCategory(e.target.value)}>
            <option value=''>Select the category</option>
            {
                categories.map(c => <option key={c} value={c}>{c}</option>)
            }
        </select>

        <button onClick={clearFilterByCategory}>Clear Filter</button>

        {
            validationError && <h3>{validationError}</h3>
        }

        {
            filteredProducts.length > 0 &&
            <ul>
                {
                    filteredProducts.map(product => <ProductCard setSelectedProductId={setSelectedProductId} key={product.id} product={product} />)
                }
            </ul>
        }
    </section >;
}

export default memo(ProductsList);