import { useContext, useState } from "react";
import ProductDetails from "./ProductDetails.jsx";
import ProductsList from "./ProductsList.jsx";
import { ProductsContext } from "../context/ProductsContext.js";
import SearchBar from "./SearchBar.jsx";
import filterProducts from "../utils/filterProducts.js";
import validateProducts from "../utils/validateProducts.js";
import FilterByCategory from "./FilterByCategory.jsx";

function ProductsView() {
    const { products } = useContext(ProductsContext);

    // States which are living here for the persistence 
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [searchValue, setSearchValue] = useState('');
    const [category, setCategory] = useState('');
    //---------------------------------------------------------------


    const categories = Array.from(new Set(products.map(p => p.category)));

    const filteredProducts = filterProducts(products, category, searchValue);

    const validationError = validateProducts(products, filteredProducts, categories, category, searchValue);


    const selectedProduct = (selectedProductId) ?
        products.find(p => p.id === selectedProductId) : null;

    if (selectedProduct) {
        return <ProductDetails
            product={selectedProduct}
            setSelectedProductId={setSelectedProductId}>
        </ProductDetails>;
    }


    return <section>
        <SearchBar
            searchValue={searchValue}
            setSearchValue={setSearchValue}>
        </SearchBar>

        <FilterByCategory
            categories={categories}
            category={category}
            setCategory={setCategory}>
        </FilterByCategory>

        <ProductsList
            products={filteredProducts}
            setSelectedProductId={setSelectedProductId}
            validationError={validationError}>
        </ProductsList>
    </section>;
}

export default ProductsView;