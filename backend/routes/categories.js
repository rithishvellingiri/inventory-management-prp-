const express = require('express');
const Category = require('../models/Category');
const Product = require('../models/Product');
const History = require('../models/History');
const { authenticate, authorizeAdmin, optionalAuth } = require('../middleware/auth');
const { validateCategory, validateObjectId, validatePagination } = require('../middleware/validation');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', optionalAuth, validatePagination, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = { isActive: true };
        if (req.query.search) {
            filter.name = { $regex: req.query.search, $options: 'i' };
        }

        const categories = await Category.find(filter)
            .sort({ name: 1 })
            .skip(skip)
            .limit(limit);

        const total = await Category.countDocuments(filter);

        res.json({
            success: true,
            data: {
                categories,
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

// @route   GET /api/categories/:id
// @desc    Get category by ID
// @access  Public
router.get('/:id', optionalAuth, validateObjectId('id'), async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return next(new AppError('Category not found', 404));
        }

        res.json({
            success: true,
            data: {
                category
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/categories
// @desc    Create new category (admin only)
// @access  Private/Admin
router.post('/', authenticate, authorizeAdmin, validateCategory, async (req, res, next) => {
    try {
        const { name, description } = req.body;

        // Check if category already exists
        const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (existingCategory) {
            return next(new AppError('Category with this name already exists', 400));
        }

        const category = new Category({
            name,
            description
        });

        await category.save();

        // Log category creation to history
        await History.create({
            userId: req.user._id,
            actionType: 'category_creation',
            description: `Admin ${req.user.fullName} created category: ${category.name}`,
            metadata: { categoryId: category._id },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: {
                category
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/categories/:id
// @desc    Update category (admin only)
// @access  Private/Admin
router.put('/:id', authenticate, authorizeAdmin, validateObjectId('id'), validateCategory, async (req, res, next) => {
    try {
        const { name, description } = req.body;

        // Check if category exists
        const category = await Category.findById(req.params.id);
        if (!category) {
            return next(new AppError('Category not found', 404));
        }

        // Check if new name conflicts with existing category
        if (name !== category.name) {
            const existingCategory = await Category.findOne({
                name: { $regex: new RegExp(`^${name}$`, 'i') },
                _id: { $ne: req.params.id }
            });
            if (existingCategory) {
                return next(new AppError('Category with this name already exists', 400));
            }
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            { name, description },
            { new: true, runValidators: true }
        );

        // Log category update to history
        await History.create({
            userId: req.user._id,
            actionType: 'category_update',
            description: `Admin ${req.user.fullName} updated category: ${updatedCategory.name}`,
            metadata: { categoryId: updatedCategory._id, changes: { name, description } },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: 'Category updated successfully',
            data: {
                category: updatedCategory
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/categories/:id
// @desc    Delete category (admin only)
// @access  Private/Admin
router.delete('/:id', authenticate, authorizeAdmin, validateObjectId('id'), async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return next(new AppError('Category not found', 404));
        }

        // Check if category has products
        const productsCount = await Product.countDocuments({ categoryId: req.params.id });
        if (productsCount > 0) {
            return next(new AppError(`Cannot delete category. It has ${productsCount} associated products.`, 400));
        }

        await Category.findByIdAndDelete(req.params.id);

        // Log category deletion to history
        await History.create({
            userId: req.user._id,
            actionType: 'category_deletion',
            description: `Admin ${req.user.fullName} deleted category: ${category.name}`,
            metadata: { categoryId: category._id },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/categories/:id/toggle-status
// @desc    Toggle category active status (admin only)
// @access  Private/Admin
router.put('/:id/toggle-status', authenticate, authorizeAdmin, validateObjectId('id'), async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return next(new AppError('Category not found', 404));
        }

        category.isActive = !category.isActive;
        await category.save();

        // Log status change to history
        await History.create({
            userId: req.user._id,
            actionType: 'category_status_change',
            description: `Admin ${req.user.fullName} ${category.isActive ? 'activated' : 'deactivated'} category: ${category.name}`,
            metadata: { categoryId: category._id, newStatus: category.isActive },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
            data: {
                category
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/categories/:id/products
// @desc    Get products by category
// @access  Public
router.get('/:id/products', optionalAuth, validateObjectId('id'), validatePagination, async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return next(new AppError('Category not found', 404));
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const products = await Product.find({
            categoryId: req.params.id,
            isActive: true
        })
            .populate('categoryId', 'name')
            .populate('supplierId', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Product.countDocuments({
            categoryId: req.params.id,
            isActive: true
        });

        res.json({
            success: true,
            data: {
                category,
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

module.exports = router;

