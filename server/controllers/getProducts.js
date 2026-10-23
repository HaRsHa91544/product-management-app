import Product from "../models/Product.js";
import sendResponse from "../utils/sendResponse.js";

const getProducts = async (req, res, next) => {
    const products = await Product.find();
    return sendResponse(
        res,
        200,
        true,
        'Products fetched successfully',
        products
    );
};

export default getProducts;