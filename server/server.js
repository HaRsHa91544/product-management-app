import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import getProducts from './controllers/getProducts.js';
import addProduct from './controllers/addProduct.js';
import updateProduct from './controllers/updateProduct.js';
import deleteProduct from './controllers/deleteProduct.js';
import requestValidator from './middlewares/requestValidator.js';
import addProductValidator from './validators/addProductValidator.js';

dotenv.config();

const { PORT, MONGODB_URI } = process.env;

const server = express();

server.use(express.json());

server.get('/products', getProducts);

server.post('/products', requestValidator(addProductValidator), addProduct);

server.put('/products/:id', updateProduct);

server.delete('/products/:id', deleteProduct);

server.listen(PORT, async () => {
    console.log('Server uriking on 6969!');
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB Cluster!');
    }
    catch (e) {
        console.log('Failed to connect to MongoDB Cluster!');
        console.log(e);
    }
});