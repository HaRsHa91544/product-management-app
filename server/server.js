import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import requestValidator from './middlewares/requestValidator.js';
import errorHandler from './middlewares/errorHandler.js';

import getProducts from './controllers/getProducts.js';
import addProduct from './controllers/addProduct.js';
import updateProduct from './controllers/updateProduct.js';
import deleteProduct from './controllers/deleteProduct.js';

import addProductValidator from './validators/addProductValidator.js';
import updateProductValidator from './validators/updateProductValidator.js';

dotenv.config();

const { PORT, MONGODB_URI } = process.env;

const server = express();

// JSON middleware
server.use(express.json());

server.get('/products', getProducts);

server.post(
    '/products',
    requestValidator(addProductValidator),
    addProduct
);

server.put(
    '/products/:id',
    requestValidator(updateProductValidator),
    updateProduct
);

server.delete(
    '/products/:id',
    deleteProduct
);

// Global Error Handler
server.use(errorHandler);

server.listen(PORT, async () => {
    console.log('Server uriking on 6969!');
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB Cluster!\n\n');
    }
    catch (e) {
        console.log('==== Failed to connect to MongoDB Cluster! ====\n\n');
        console.log(e);
    }
});