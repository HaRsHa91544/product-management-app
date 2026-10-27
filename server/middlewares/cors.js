const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5500'
];

const cors = (req, res, next) => {
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, PATCH, DELETE'
    );

    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }

    next();
};

export default cors;