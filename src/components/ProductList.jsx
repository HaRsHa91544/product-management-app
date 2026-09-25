import { useContext, useState } from "react";
import { ProductsContext } from "../context/ProductsContext.js";
import ProductCard from "./ProductCard.jsx";
import SearchBar from "./SearchBar.jsx";

function ProductsList() {
    const { products } = useContext(ProductsContext);

    const [searchValue, setSearchValue] = useState('');
    const [filterByCategory, setFilterByCategory] = useState('');

    const categories = Array.from(new Set(products.map(p => p.category)));

    
    /* 
        To check the selected category really exists in the current product's categories.
        It is useful when all products of a category are removed and filterByCategory still
        stored the deleted category.
    */
    if (filterByCategory && !categories.includes(filterByCategory)) {
        setFilterByCategory('');
    }


    let filteredProducts = products;

    if (filterByCategory) {
        filteredProducts = products.filter(p => p.category == filterByCategory)
    }
    if (searchValue) {
        filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(searchValue.toLowerCase()))
    }

    return <section>
        <h1>Products List</h1>

        <SearchBar searchValue={searchValue} setSearchValue={setSearchValue}></SearchBar>

        <select onChange={(e) => setFilterByCategory(e.target.value)}>
            <option value=''>Select the category</option>
            {
                categories.map(c => <option key={c} value={c}>{c}</option>)
            }
        </select>

        {
            filteredProducts.length === 0 &&
            <h3>No products found!</h3>
        }

        {
            filteredProducts.length > 0 &&
            <ul>
                {
                    filteredProducts.map(product => <ProductCard key={product.id} product={product} />)
                }
            </ul>
        }
    </section >;
}

export default ProductsList;