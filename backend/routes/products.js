const express = require('express');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const History = require('../models/History');
const { authenticate, authorizeAdmin, optionalAuth } = require('../middleware/auth');
const { validateProduct, validateObjectId, validatePagination } = require('../middleware/validation');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get('/', optionalAuth, validatePagination, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = { isActive: true };

        // Search by name or description
        if (req.query.search) {
            filter.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        // Filter by category
        if (req.query.categoryId) {
            filter.categoryId = req.query.categoryId;
        }

        // Filter by supplier
        if (req.query.supplierId) {
            filter.supplierId = req.query.supplierId;
        }

        // Filter by price range
        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {};
            if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
            if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
        }

        // Filter by stock
        if (req.query.inStock === 'true') {
            filter.stock = { $gt: 0 };
        } else if (req.query.inStock === 'false') {
            filter.stock = 0;
        }

        // Filter by low stock
        if (req.query.lowStock === 'true') {
            filter.$expr = { $lte: ['$stock', '$lowStockThreshold'] };
        }

        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        const sort = { [sortBy]: sortOrder };

        const products = await Product.find(filter)
            .populate('categoryId', 'name')
            .populate('supplierId', 'name')
            .sort(sort)
            .skip(skip)
            .limit(limit);

        const total = await Product.countDocuments(filter);

        res.json({
            success: true,
            data: {
                products,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', optionalAuth, validateObjectId('id'), async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('categoryId', 'name')
            .populate('supplierId', 'name');

        if (!product) {
            return next(new AppError('Product not found', 404));
        }

        res.json({
            success: true,
            data: {
                product
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/products
// @desc    Create new product (admin only)
// @access  Private/Admin
router.post('/', authenticate, authorizeAdmin, validateProduct, async (req, res, next) => {
    try {
        const { name, categoryId, supplierId, price, stock, description, image, lowStockThreshold } = req.body;

        // Verify category exists
        const category = await Category.findById(categoryId);
        if (!category) {
            return next(new AppError('Category not found', 404));
        }

        // Verify supplier exists
        const supplier = await Supplier.findById(supplierId);
        if (!supplier) {
            return next(new AppError('Supplier not found', 404));
        }

        // Check if product with same name already exists
        const existingProduct = await Product.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') }
        });
        if (existingProduct) {
            return next(new AppError('Product with this name already exists', 400));
        }

        const product = new Product({
            name,
            categoryId,
            supplierId,
            price,
            stock,
            description,
            image,
            lowStockThreshold
        });

        await product.save();

        // Populate the created product
        await product.populate('categoryId', 'name');
        await product.populate('supplierId', 'name');

        // Log product creation to history
        await History.create({
            userId: req.user._id,
            actionType: 'product_creation',
            description: `Admin ${req.user.fullName} created product: ${product.name}`,
            metadata: { productId: product._id },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: {
                product
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/products/:id
// @desc    Update product (admin only)
// @access  Private/Admin
router.put('/:id', authenticate, authorizeAdmin, validateObjectId('id'), validateProduct, async (req, res, next) => {
    try {
        const { name, categoryId, supplierId, price, stock, description, image, lowStockThreshold } = req.body;

        // Check if product exists
        const product = await Product.findById(req.params.id);
        if (!product) {
            return next(new AppError('Product not found', 404));
        }

        // Verify category exists
        const category = await Category.findById(categoryId);
        if (!category) {
            return next(new AppError('Category not found', 404));
        }

        // Verify supplier exists
        const supplier = await Supplier.findById(supplierId);
        if (!supplier) {
            return next(new AppError('Supplier not found', 404));
        }

        // Check if new name conflicts with existing product
        if (name !== product.name) {
            const existingProduct = await Product.findOne({
                name: { $regex: new RegExp(`^${name}$`, 'i') },
                _id: { $ne: req.params.id }
            });
            if (existingProduct) {
                return next(new AppError('Product with this name already exists', 400));
            }
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { name, categoryId, supplierId, price, stock, description, image, lowStockThreshold },
            { new: true, runValidators: true }
        ).populate('categoryId', 'name').populate('supplierId', 'name');

        // Log product update to history
        await History.create({
            userId: req.user._id,
            actionType: 'product_update',
            description: `Admin ${req.user.fullName} updated product: ${updatedProduct.name}`,
            metadata: {
                productId: updatedProduct._id,
                changes: { name, categoryId, supplierId, price, stock, description, image, lowStockThreshold }
            },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: {
                product: updatedProduct
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/products/:id
// @desc    Delete product (admin only)
// @access  Private/Admin
router.delete('/:id', authenticate, authorizeAdmin, validateObjectId('id'), async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return next(new AppError('Product not found', 404));
        }

        await Product.findByIdAndDelete(req.params.id);

        // Log product deletion to history
        await History.create({
            userId: req.user._id,
            actionType: 'product_deletion',
            description: `Admin ${req.user.fullName} deleted product: ${product.name}`,
            metadata: { productId: product._id },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/products/:id/toggle-status
// @desc    Toggle product active status (admin only)
// @access  Private/Admin
router.put('/:id/toggle-status', authenticate, authorizeAdmin, validateObjectId('id'), async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return next(new AppError('Product not found', 404));
        }

        product.isActive = !product.isActive;
        await product.save();

        // Log status change to history
        await History.create({
            userId: req.user._id,
            actionType: 'product_status_change',
            description: `Admin ${req.user.fullName} ${product.isActive ? 'activated' : 'deactivated'} product: ${product.name}`,
            metadata: { productId: product._id, newStatus: product.isActive },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`,
            data: {
                product
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/products/:id/stock
// @desc    Update product stock (admin only)
// @access  Private/Admin
router.put('/:id/stock', authenticate, authorizeAdmin, validateObjectId('id'), async (req, res, next) => {
    try {
        const { stock, operation } = req.body; // operation: 'set', 'add', 'subtract'

        if (!stock && stock !== 0) {
            return next(new AppError('Stock value is required', 400));
        }

        if (!['set', 'add', 'subtract'].includes(operation)) {
            return next(new AppError('Operation must be set, add, or subtract', 400));
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return next(new AppError('Product not found', 404));
        }

        let newStock;
        switch (operation) {
            case 'set':
                newStock = stock;
                break;
            case 'add':
                newStock = product.stock + stock;
                break;
            case 'subtract':
                newStock = product.stock - stock;
                break;
        }

        if (newStock < 0) {
            return next(new AppError('Stock cannot be negative', 400));
        }

        product.stock = newStock;
        await product.save();

        // Log stock update to history
        await History.create({
            userId: req.user._id,
            actionType: 'stock_update',
            description: `Admin ${req.user.fullName} updated stock for ${product.name}: ${operation} ${stock} (new total: ${newStock})`,
            metadata: {
                productId: product._id,
                operation,
                stockChange: stock,
                oldStock: product.stock - (operation === 'add' ? stock : operation === 'subtract' ? -stock : 0),
                newStock
            },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: 'Stock updated successfully',
            data: {
                product: product.toJSON()
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/products/stats/overview
// @desc    Get product statistics (admin only)
// @access  Private/Admin
router.get('/stats/overview', authenticate, authorizeAdmin, async (req, res, next) => {
    try {
        const totalProducts = await Product.countDocuments();
        const activeProducts = await Product.countDocuments({ isActive: true });
        const outOfStock = await Product.countDocuments({ stock: 0 });
        const lowStock = await Product.countDocuments({
            $expr: { $lte: ['$stock', '$lowStockThreshold'] }
        });

        // Get total inventory value
        const inventoryValue = await Product.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: null, totalValue: { $sum: { $multiply: ['$price', '$stock'] } } } }
        ]);

        res.json({
            success: true,
            data: {
                totalProducts,
                activeProducts,
                inactiveProducts: totalProducts - activeProducts,
                outOfStock,
                lowStock,
                totalInventoryValue: inventoryValue[0]?.totalValue || 0
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

