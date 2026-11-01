const getProducts = async () => {
    const req = await fetch('https://product-management-app-e2b0.onrender.com/products');
    const res = await req.json();
    if (!res.success) {
        throw new Error(res.message);
    }
    const products = res.data;
    return products;
};

export default getProducts;