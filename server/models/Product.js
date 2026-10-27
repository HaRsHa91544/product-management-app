import mongoose from 'mongoose';
import NAME_ERRORS from '../errors/product/nameErrors.js';
import PRICE_ERRORS from '../errors/product/priceErrors.js';
import CATEGORY_ERRORS from '../errors/product/categoryErrors.js';
import DESCRIPTION_ERRORS from '../errors/product/descriptionErrors.js';
import STOCK_QUANTITY_ERRORS from '../errors/product/stockQuantityErrors.js';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, NAME_ERRORS.REQUIRED],
        min: [3, NAME_ERRORS.MIN],
        trim: true
    },
    price: {
        type: Number,
        cast: PRICE_ERRORS.VALID,
        required: [true, PRICE_ERRORS.REQUIRED],
        min: [1, PRICE_ERRORS.MIN]
    },
    category: {
        type: String,
        required: [true, CATEGORY_ERRORS.REQUIRED],
        min: [3, CATEGORY_ERRORS.MIN],
        trim: true
    },
    description: {
        type: String,
        required: [true, DESCRIPTION_ERRORS.REQUIRED],
        min: [3, DESCRIPTION_ERRORS.MIN],
        trim: true
    },
    stockQuantity: {
        type: Number,
        cast: STOCK_QUANTITY_ERRORS.VALID,
        required: [true, STOCK_QUANTITY_ERRORS.REQUIRED],
        min: [1, STOCK_QUANTITY_ERRORS.MIN]
    },
    isExists: {
        type: Boolean,
        required: true,
        default: true
    }
});

// Arrange the categories based on ascending order
productSchema.index({ category: 1 });

const Product = mongoose.model('Product', productSchema);
export default Product;