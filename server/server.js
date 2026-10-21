import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import getModelErrors from './utils/getModelErrors.js';
import sendResponse from './utils/sendResponse.js';

dotenv.config();

const { PORT, MONGODB_URI } = process.env;

const server = express();

server.use(express.json());

server.get('/products', async (req, res) => {
    const products = await Product.find();
    return sendResponse(
        res,
        200,
        true,
        'Products fetched successfully',
        products
    );
});

server.post('/products', async (req, res) => {
    const product = req.body;
    try {
        const newProduct = await Product.create(product);
        return sendResponse(
            res,
            201,
            true,
            'Product created successfully',
            newProduct
        );
    }
    catch (error) {
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
});

server.put('/products/:id', async (req, res) => {
    const { id } = req.params;
    if (!id)
        return sendResponse(
            res,
            400,
            false,
            'Product id is not provided'
        );

    const product = req.body;
    try {
        const updatedProduct = await Product.findByIdAndUpdate(id, product,
            { runValidators: true }
        );
        return sendResponse(
            res,
            200,
            true,
            'Product updated successfully',
            updatedProduct
        );
    }
    catch (error) {
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
});

server.delete('/products/:id', async (req, res) => {
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
});

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