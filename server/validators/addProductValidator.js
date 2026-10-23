import z from "zod";
import NAME_ERRORS from "../errors/product/nameErrors.js";
import PRICE_ERRORS from "../errors/product/priceErrors.js";
import CATEGORY_ERRORS from "../errors/product/categoryErrors.js";
import DESCRIPTION_ERRORS from "../errors/product/descriptionErrors.js";
import STOCK_QUANTITY_ERRORS from "../errors/product/stockQuantityErrors.js";

const addProductValidator = z.object({
    name: z
        .string({ error: NAME_ERRORS.REQUIRED })
        .trim()
        .min(3, NAME_ERRORS.MIN),
    price: z
        .number({ error: PRICE_ERRORS.VALID })
        .min(1, PRICE_ERRORS.MIN),
    category: z
        .string({ error: CATEGORY_ERRORS.REQUIRED })
        .trim()
        .min(3, CATEGORY_ERRORS.MIN),
    description: z
        .string({ error: DESCRIPTION_ERRORS.REQUIRED })
        .trim()
        .min(3, DESCRIPTION_ERRORS.MIN),
    stockQuantity: z
        .number({ error: STOCK_QUANTITY_ERRORS.VALID })
        .min(1, STOCK_QUANTITY_ERRORS.MIN),
    isExists: z
        .boolean()
        .default(true)
}, { error: 'Product input data is invalid' });

export default addProductValidator;