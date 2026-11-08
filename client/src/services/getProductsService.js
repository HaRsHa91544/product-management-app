const getProductsService = async () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const req = await fetch(API_URL + 'products/');
    const res = await req.json();
    if (!res.success) {
        throw new Error(res.message);
    }
    const products = res.data;
    return products;
};

export default getProductsService;