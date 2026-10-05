import { useContext, useState } from "react";
import ProductDetails from "./ProductDetails.jsx";
import ProductsList from "./ProductsList.jsx";
import { ProductsContext } from "../context/ProductsContext.js";
import SearchBar from "./SearchBar.jsx";

function ProductsView() {
    const { products } = useContext(ProductsContext);

    // States which are living here for the persistence 
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [searchValue, setSearchValue] = useState('');
    const [filterByCategory, setFilterByCategory] = useState('');
    //---------------------------------------------------------------


    const categories = Array.from(new Set(products.map(p => p.category)));

    function clearFilterByCategory() {
        setFilterByCategory('');
    }
    

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


    const selectedProduct = (selectedProductId) ?
        products.find(p => p.id === selectedProductId) : null;

    if (selectedProduct) {
        return <ProductDetails
            product={selectedProduct}
            setSelectedProductId={setSelectedProductId}>
        </ProductDetails>;
    }


    return <section>
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

        <ProductsList
            products={filteredProducts}
            setSelectedProductId={setSelectedProductId}
            validationError={validationError}>
        </ProductsList>
    </section>;
}

export default ProductsView;