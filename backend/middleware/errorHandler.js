const History = require('../models/History');

// Custom error class
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

// Log error to history
const logError = async (error, req) => {
    try {
        if (req.user) {
            await History.create({
                userId: req.user._id,
                actionType: 'error',
                description: `Error: ${error.message}`,
                metadata: {
                    statusCode: error.statusCode,
                    stack: error.stack,
                    url: req.originalUrl,
                    method: req.method
                },
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            });
        }
    } catch (logError) {
        console.error('Failed to log error to history:', logError);
    }
};

// Handle MongoDB duplicate key error
const handleDuplicateKeyError = (error) => {
    const field = Object.keys(error.keyValue)[0];
    const message = `${field} already exists`;
    return new AppError(message, 400);
};

// Handle MongoDB validation error
const handleValidationError = (error) => {
    const errors = Object.values(error.errors).map(err => err.message);
    const message = `Invalid input data: ${errors.join('. ')}`;
    return new AppError(message, 400);
};

// Handle MongoDB cast error
const handleCastError = (error) => {
    const message = `Invalid ${error.path}: ${error.value}`;
    return new AppError(message, 400);
};

// Send error response in development
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: 'error',
        error: err,
        message: err.message,
        stack: err.stack
    });
};

// Send error response in production
const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: 'error',
            message: err.message
        });
    } else {
        // Programming or other unknown error: don't leak error details
        console.error('ERROR 💥', err);
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong!'
        });
    }
};

// Global error handling middleware
const globalErrorHandler = async (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log error to history
    await logError(err, req);

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else {
        let error = { ...err };
        error.message = err.message;

        if (error.code === 11000) error = handleDuplicateKeyError(error);
        if (error.name === 'ValidationError') error = handleValidationError(error);
        if (error.name === 'CastError') error = handleCastError(error);

        sendErrorProd(error, res);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log('Unhandled Promise Rejection:', err.message);
    // Close server & exit process
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.log('Uncaught Exception:', err.message);
    process.exit(1);
});

module.exports = {
    AppError,
    globalErrorHandler
};

