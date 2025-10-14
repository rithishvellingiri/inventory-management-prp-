const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

// User validation rules
const validateUserRegistration = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('fullName')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be between 2 and 100 characters'),
    body('phone')
        .optional()
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),
    handleValidationErrors
];

const validateUserLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    handleValidationErrors
];

// Product validation rules
const validateProduct = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Product name must be between 2 and 100 characters'),
    body('categoryId')
        .isMongoId()
        .withMessage('Please provide a valid category ID'),
    body('supplierId')
        .isMongoId()
        .withMessage('Please provide a valid supplier ID'),
    body('price')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    body('stock')
        .isInt({ min: 0 })
        .withMessage('Stock must be a non-negative integer'),
    body('description')
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Description must be between 10 and 500 characters'),
    handleValidationErrors
];

// Category validation rules
const validateCategory = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Category name must be between 2 and 50 characters'),
    body('description')
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage('Description must be between 5 and 200 characters'),
    handleValidationErrors
];

// Supplier validation rules
const validateSupplier = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Supplier name must be between 2 and 100 characters'),
    body('contact')
        .trim()
        .isLength({ min: 5, max: 20 })
        .withMessage('Contact must be between 5 and 20 characters'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('address')
        .trim()
        .isLength({ min: 10, max: 200 })
        .withMessage('Address must be between 10 and 200 characters'),
    handleValidationErrors
];

// Order validation rules
const validateOrder = [
    body('items')
        .isArray({ min: 1 })
        .withMessage('Order must contain at least one item'),
    body('items.*.productId')
        .isMongoId()
        .withMessage('Please provide valid product IDs'),
    body('items.*.quantity')
        .isInt({ min: 1 })
        .withMessage('Quantity must be at least 1'),
    body('items.*.price')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    body('totalAmount')
        .isFloat({ min: 0 })
        .withMessage('Total amount must be a positive number'),
    body('paymentId')
        .notEmpty()
        .withMessage('Payment ID is required'),
    handleValidationErrors
];

// Cart validation rules
const validateCartItem = [
    body('productId')
        .isMongoId()
        .withMessage('Please provide a valid product ID'),
    body('quantity')
        .isInt({ min: 1 })
        .withMessage('Quantity must be at least 1'),
    handleValidationErrors
];

// Feedback validation rules
const validateFeedback = [
    body('message')
        .trim()
        .isLength({ min: 5, max: 500 })
        .withMessage('Message must be between 5 and 500 characters'),
    body('type')
        .optional()
        .isIn(['feedback', 'enquiry'])
        .withMessage('Type must be either feedback or enquiry'),
    body('productId')
        .optional()
        .isMongoId()
        .withMessage('Please provide a valid product ID'),
    body('rating')
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),
    handleValidationErrors
];

// MongoDB ObjectId validation
const validateObjectId = (paramName) => [
    param(paramName)
        .isMongoId()
        .withMessage(`Invalid ${paramName}`),
    handleValidationErrors
];

// Pagination validation
const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    handleValidationErrors
];

module.exports = {
    handleValidationErrors,
    validateUserRegistration,
    validateUserLogin,
    validateProduct,
    validateCategory,
    validateSupplier,
    validateOrder,
    validateCartItem,
    validateFeedback,
    validateObjectId,
    validatePagination
};

