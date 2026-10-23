import Product from "../models/Product.js";
import sendResponse from "../utils/sendResponse.js";

const deleteProduct = async (req, res, next) => {
    const { id } = req.params;
    if (!id)
        return sendResponse(
            res,
            400,
            false,
            'Product ID is not provided'
        );

    const deletedProduct = await Product.findByIdAndDelete(id);
    if (deletedProduct)
        return sendResponse(res, 204, true, 'Product deleted successfully');

    return sendResponse(
        res,
        404,
        false,
        `Product with id ${id} not found to delete`
    );
};

export default deleteProduct;