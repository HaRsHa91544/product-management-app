import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import sendResponse from './utils/sendResponse.js';
import connectDB from './config/database.js';
import Product from './models/Product.js';

dotenv.config();

const server = express();

const { PORT } = process.env;

server.use(morgan('dev'));

server.get('/health', (req, res) => {
    sendResponse(res, 200, true, 'It is working priya!');
});

server.get('/products', async (req, res) => {
    const products = await Product.find();
    sendResponse(res, 200, true, 'Products fetched successfully', products);
});

server.listen(PORT, async () => {
    await connectDB();
    console.log(`PM Server uriking on ${PORT}!`);
});