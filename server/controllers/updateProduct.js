import Product from "../models/Product.js";
import sendResponse from "../utils/sendResponse.js";
import getModelErrors from "../utils/getModelErrors.js";
import mongoose from "mongoose";

const updateProduct = async (req, res) => {
    const { id } = req.params;
    if (!id)
        return sendResponse(
            res,
            400,
            false,
            'Product id is not provided'
        );

    const product = req.body;
    try {
        const updatedProduct = await Product.findByIdAndUpdate(id, product,
            { runValidators: true }
        );
        return sendResponse(
            res,
            200,
            true,
            'Product updated successfully',
            updatedProduct
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

export default updateProduct;