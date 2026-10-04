import { useContext, useState } from "react";
import ProductDetails from "./ProductDetails.jsx";
import ProductsList from "./ProductsList.jsx";
import { ProductsContext } from "../context/ProductsContext.js";

function ProductsView() {
    const { products } = useContext(ProductsContext);
    
    // States which are living here for the persistence 
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [searchValue, setSearchValue] = useState('');
    const [filterByCategory, setFilterByCategory] = useState('');
    //---------------------------------------------------------------

    const selectedProduct = (selectedProductId) ?
        products.find(p => p.id === selectedProductId) : null;

    if (selectedProduct) {
        return <ProductDetails
            product={selectedProduct}
            setSelectedProductId={setSelectedProductId}>
        </ProductDetails>;
    }

    return <ProductsList
        setSelectedProductId={setSelectedProductId}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        filterByCategory={filterByCategory}
        setFilterByCategory={setFilterByCategory}>
    </ProductsList>;
}

export default ProductsView;