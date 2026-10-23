import z from "zod";
import NAME_ERRORS from "../errors/product/nameErrors.js";
import PRICE_ERRORS from "../errors/product/priceErrors.js";
import CATEGORY_ERRORS from "../errors/product/categoryErrors.js";
import DESCRIPTION_ERRORS from "../errors/product/descriptionErrors.js";
import STOCK_QUANTITY_ERRORS from "../errors/product/stockQuantityErrors.js";

const updateProductValidator = z.object({
    name: z
        .string()
        .trim()
        .min(3, NAME_ERRORS.MIN)
        .optional(),
    price: z
        .number({ error: PRICE_ERRORS.VALID })
        .min(1, PRICE_ERRORS.MIN)
        .optional(),
    category: z
        .string()
        .trim()
        .min(3, CATEGORY_ERRORS.MIN)
        .optional(),
    description: z
        .string()
        .trim()
        .min(3, DESCRIPTION_ERRORS.MIN)
        .optional(),
    stockQuantity: z
        .number({ error: STOCK_QUANTITY_ERRORS.VALID })
        .min(1, STOCK_QUANTITY_ERRORS.MIN)
        .optional()
}, { error: 'Product input data is invalid' }).refine(
    (data) => Object.values(data).some(
        (value) => value != undefined
    ),
    {
        message: 'At least one field must be provided'
    }
);

export default updateProductValidator;