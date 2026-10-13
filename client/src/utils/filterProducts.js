export default function filterProducts(products, category, searchValue) {
    let filteredProducts = products;

    if (category) {
        filteredProducts = products.filter(p => p.category == category);
    }

    if (searchValue) {
        filteredProducts = filteredProducts
            .filter(p => p.name.toLowerCase().includes(searchValue.toLowerCase()));
    }

    return filteredProducts;
}