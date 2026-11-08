const addProductService = async (product) => {
    const API_URL = import.meta.env.VITE_API_URL;

    const req = await fetch(API_URL + 'products/', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(product)
    });

    const res = await req.json();
    if (!res.success) {
        throw new Error(res.message, { cause: res.errors });
    }
    return res.data;
};

export default addProductService;