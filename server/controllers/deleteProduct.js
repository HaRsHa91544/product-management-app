import Product from "../models/Product.js";
import sendResponse from "../utils/sendResponse.js";
import getModelErrors from "../utils/getModelErrors.js";
import mongoose from "mongoose";

const deleteProduct = async (req, res) => {
    const { id } = req.params;
    if (!id)
        return sendResponse(
            res,
            400,
            false,
            'Product id is not provided'
        );

    try {
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (deletedProduct)
            return sendResponse(res, 204, true, 'Product deleted successfully');

        return sendResponse(
            res,
            404,
            false,
            `Product with id ${id} not found to delete`
        );
    } catch (error) {
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

export default deleteProduct;