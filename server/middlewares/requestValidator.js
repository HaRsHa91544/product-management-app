import z from "zod";
import sendResponse from "../utils/sendResponse.js";
import getZodSchemaErrors from "../utils/getZodSchemaErrors.js";

const requestValidator = (schema) => {
    return (req, res, next) => {
        try {
            const validate = schema.parse(req.body);
            if (validate.success) next();
        }
        catch (error) {
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
        }
    };
};

export default requestValidator;