export default function validateProducts(products, filteredProducts, categories, category, searchValue) {
    if (products.length === 0)
        return 'No products available';

    else if (category && !categories.includes(category))
        return 'The selected filter is no longer valid, clear the filter';

    else if (filteredProducts.length === 0 && searchValue)
        return 'No products found for your search';
    
    return '';
}