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

    if (error.kind === 'ObjectId') {
        return sendResponse(
            res,
            400,
            false,
            `Given ID:${error.value} is invalid`
        );
    }

    if (error instanceof mongoose.Error.ValidationError) {
        return sendResponse(
            res,
            400,
            false,
            'Product input data is invalid',
            null,
            getModelErrors(error)
        );
    }

    if (error instanceof mongoose.Error) {
        return sendResponse(
            res,
            503,
            false,
            'Web server is temporarily unavailable to serve your request',
            null
        );
    }

    if (error.code === 11000) {
        return sendResponse(
            res,
            409,
            false,
            'Given entity already exists',
            null
        );
    }

    if (error.statusCode === 400) {
        return sendResponse(
            res,
            400,
            false,
            'The request is invalid',
            null
        );
    }
};

export default errorHandler;