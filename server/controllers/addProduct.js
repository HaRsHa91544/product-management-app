import Product from "../models/Product.js";
import sendResponse from "../utils/sendResponse.js";

const addProduct = async (req, res, next) => {
    const product = req.body;
    const newProduct = await Product.create(product);
    return sendResponse(
        res,
        201,
        true,
        'Product created successfully',
        newProduct
    );
};

export default addProduct;