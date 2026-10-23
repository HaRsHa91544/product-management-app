import Product from "../models/Product.js";
import sendResponse from "../utils/sendResponse.js";

const updateProduct = async (req, res, next) => {
    const { id } = req.params;

    if (!id)
        return sendResponse(
            res,
            400,
            false,
            'Product ID is not provided'
        );

    const product = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
        id,
        product,
        {
            runValidators: true,
            returnDocument: 'after'
        }
    );

    return sendResponse(
        res,
        200,
        true,
        'Product updated successfully',
        updatedProduct
    );
};

export default updateProduct;