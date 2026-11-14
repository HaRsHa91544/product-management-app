import CATEGORY_ERRORS from "../errors/product/categoryErrors.js";
import DESCRIPTION_ERRORS from "../errors/product/descriptionErrors.js";
import NAME_ERRORS from "../errors/product/nameErrors.js";
import PRICE_ERRORS from "../errors/product/priceErrors.js";
import STOCK_QUANTITY_ERRORS from "../errors/product/stockQuantityErrors.js";

export default function validateProductForm(productForm) {
    const validationErrors = {
        name: '',
        price: '',
        category: '',
        description: '',
        stockQuantity: ''
    };

    if (productForm.name.length < 3) {
        validationErrors.name = NAME_ERRORS.MIN;
    }

    if (!(Number(productForm.price)) || (Number(productForm.price)) <= 0) {
        validationErrors.price = PRICE_ERRORS.MIN;
    }

    if (productForm.category.length < 3) {
        validationErrors.category = CATEGORY_ERRORS.MIN;
    }

    if (productForm.description.length < 3) {
        validationErrors.description = DESCRIPTION_ERRORS.MIN;
    }

    if (!(Number(productForm.stockQuantity)) || (Number(productForm.stockQuantity)) <= 0) {
        validationErrors.stockQuantity = STOCK_QUANTITY_ERRORS.MIN;
    }

    return validationErrors;
}