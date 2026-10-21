const getModelErrors = (validationError) => {
    if (validationError.kind === 'ObjectId') {
        return { id: `Given ID ${validationError.value} is invalid` };
    }

    const { errors: fieldErrors } = validationError;

    const fields = Object.keys(fieldErrors);

    const errorMessages = {};

    fields.forEach(fieldName => errorMessages[fieldName] = fieldErrors[fieldName].message);

    return errorMessages;
};

export default getModelErrors;