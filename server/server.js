import express from 'express';
import morgan from 'morgan';
import sendResponse from './utils/sendResponse.js';

const server = express();

server.use(morgan('dev'));

server.get('/health', (req, res) => {
    sendResponse(res, 200, true, 'It is working priya!');
});

server.listen(6969, async () => {
    console.log(`PM Server uriking on ${6969}!`);
});