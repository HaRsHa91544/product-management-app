import Product from "../models/Product.js";
import sendResponse from "../utils/sendResponse.js";
import getModelErrors from "../utils/getModelErrors.js";
import mongoose from "mongoose";

const addProduct = async (req, res) => {
    const product = req.body;
    try {
        const newProduct = await Product.create(product);
        return sendResponse(
            res,
            201,
            true,
            'Product created successfully',
            newProduct
        );
    }
    catch (error) {
        if (error instanceof mongoose.Error)
            return sendResponse(
                res,
                400,
                false,
                'Product input data is invalid',
                null,
                getModelErrors(error)
            );
    }
};

export default addProduct;