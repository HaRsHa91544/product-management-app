const sendResponse = (res, code, success, message, data = null, errors = null) => {
    return res.status(code).json({ success, message, data, errors });
}

export default sendResponse;