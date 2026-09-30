const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    // Print error stack to the terminal console
    console.error("Error occurred:", err.stack || err);

    res.status(statusCode).json({
        success: false,
        statusCode,
        message: err.message || 'Internal Server Error',
        stack:
            process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};

module.exports = errorHandler;