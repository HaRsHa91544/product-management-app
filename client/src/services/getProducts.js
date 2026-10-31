const getProducts = async () => {
    const req = await fetch('https://product-management-app-e2b0.onrender.com/products');
    const res = await req.json();

    const products = res.data;
    return products;
};

export default getProducts;