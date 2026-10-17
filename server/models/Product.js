import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 3,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 1
    },
    category: {
        type: String,
        required: true,
        min: 3,
        trim: true
    },
    description: {
        type: String,
        required: true,
        min: 3,
        trim: true
    },
    stockQuantity: {
        type: Number,
        required: true,
        min: 1
    },
    isExists: {
        type: Boolean,
        required: true,
        default: true
    }
});

const Product = mongoose.model('Product', productSchema);
export default Product;