import z from 'zod';
import mongoose from 'mongoose';
import sendResponse from "../utils/sendResponse.js";
import getZodSchemaErrors from "../utils/getZodSchemaErrors.js";
import getModelErrors from '../utils/getModelErrors.js';

const errorHandler = (error, req, res, next) => {
    if (error instanceof z.ZodError) {
        return sendResponse(
            res,
            400,
            false,
            'Product input data is invalid',
            null,
            getZodSchemaErrors(error.message)
        );
    }

    if (error instanceof mongoose.Error) {
        return sendResponse(
            res,
            400,
            false,
            'Product input data is invalid',
            null,
            getModelErrors(error)
        );
    }
};

export default errorHandler;