const handleServiceErrors = (e) => {
    if (e instanceof TypeError || e instanceof SyntaxError) {
        e.name = '';
        e.message = 'Something went wrong!';
    }
    return Promise.reject(e);
};

export default handleServiceErrors;