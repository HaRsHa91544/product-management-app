const deleteProductService = async (id) => {
    const API_URL = import.meta.env.VITE_API_URL;

    const req = await fetch(API_URL + 'products/' + id, {
        method: 'DELETE'
    });

    if (!req.ok) {
        const res = await req.json();
        throw new Error(res.message);
    }

    return true;
};

export default deleteProductService;