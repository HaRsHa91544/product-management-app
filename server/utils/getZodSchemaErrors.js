const getZodSchemaErrors = (errorsString) => {
    const errors = JSON.parse(errorsString);
    
    const errorMessages = {};

    errors.forEach(e => errorMessages[e.path[0]] = e.message);

    return errorMessages;
};

export default getZodSchemaErrors;