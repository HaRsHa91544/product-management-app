import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const { PORT, MONGODB_URI } = process.env;

const server = express();

server.use(express.json());

server.get('/products', async (req, res) => {
    const products = await Product.find();
    return res.status(200).json({ products });
});

server.post('/products', async (req, res) => {
    const product = req.body;
    try {
        const newProduct = await Product.create(product);
        return res.status(201).json(newProduct);
    }
    catch (e) {
        console.log(e);
        return res.status(400).json(e);
    }
});

server.put('/products/:id', async (req, res) => {
    const { id } = req.params;
    const product = req.body;
    try {
        const updatedProduct = await Product.findByIdAndUpdate(id, product);
        return res.status(200).json(updatedProduct);
    }
    catch (e) {
        console.log(e);
        return res.status(400).json(e);
    }
});

server.delete('/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (deletedProduct)
            return res.status(204).json({ message: 'Product deleted' });
        return res.status(404).json({ error: 'Product not found' });
    } catch (e) {
        console.log(e);
        return res.status(400).json(e);
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