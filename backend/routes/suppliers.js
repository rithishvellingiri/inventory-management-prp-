const express = require('express');
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const History = require('../models/History');
const { authenticate, authorizeAdmin, optionalAuth } = require('../middleware/auth');
const { validateSupplier, validateObjectId, validatePagination } = require('../middleware/validation');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

// @route   GET /api/suppliers
// @desc    Get all suppliers
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

        const suppliers = await Supplier.find(filter)
            .sort({ name: 1 })
            .skip(skip)
            .limit(limit);

        const total = await Supplier.countDocuments(filter);

        res.json({
            success: true,
            data: {
                suppliers,
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

// @route   GET /api/suppliers/:id
// @desc    Get supplier by ID
// @access  Public
router.get('/:id', optionalAuth, validateObjectId('id'), async (req, res, next) => {
    try {
        const supplier = await Supplier.findById(req.params.id);

        if (!supplier) {
            return next(new AppError('Supplier not found', 404));
        }

        res.json({
            success: true,
            data: {
                supplier
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/suppliers
// @desc    Create new supplier (admin only)
// @access  Private/Admin
router.post('/', authenticate, authorizeAdmin, validateSupplier, async (req, res, next) => {
    try {
        const { name, contact, email, address } = req.body;

        // Check if supplier already exists
        const existingSupplier = await Supplier.findOne({
            $or: [
                { email },
                { name: { $regex: new RegExp(`^${name}$`, 'i') } }
            ]
        });

        if (existingSupplier) {
            const field = existingSupplier.email === email ? 'email' : 'name';
            return next(new AppError(`Supplier with this ${field} already exists`, 400));
        }

        const supplier = new Supplier({
            name,
            contact,
            email,
            address
        });

        await supplier.save();

        // Log supplier creation to history
        await History.create({
            userId: req.user._id,
            actionType: 'supplier_creation',
            description: `Admin ${req.user.fullName} created supplier: ${supplier.name}`,
            metadata: { supplierId: supplier._id },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.status(201).json({
            success: true,
            message: 'Supplier created successfully',
            data: {
                supplier
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/suppliers/:id
// @desc    Update supplier (admin only)
// @access  Private/Admin
router.put('/:id', authenticate, authorizeAdmin, validateObjectId('id'), validateSupplier, async (req, res, next) => {
    try {
        const { name, contact, email, address } = req.body;

        // Check if supplier exists
        const supplier = await Supplier.findById(req.params.id);
        if (!supplier) {
            return next(new AppError('Supplier not found', 404));
        }

        // Check if new email/name conflicts with existing supplier
        const existingSupplier = await Supplier.findOne({
            $or: [
                { email, _id: { $ne: req.params.id } },
                { name: { $regex: new RegExp(`^${name}$`, 'i') }, _id: { $ne: req.params.id } }
            ]
        });

        if (existingSupplier) {
            const field = existingSupplier.email === email ? 'email' : 'name';
            return next(new AppError(`Supplier with this ${field} already exists`, 400));
        }

        const updatedSupplier = await Supplier.findByIdAndUpdate(
            req.params.id,
            { name, contact, email, address },
            { new: true, runValidators: true }
        );

        // Log supplier update to history
        await History.create({
            userId: req.user._id,
            actionType: 'supplier_update',
            description: `Admin ${req.user.fullName} updated supplier: ${updatedSupplier.name}`,
            metadata: { supplierId: updatedSupplier._id, changes: { name, contact, email, address } },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: 'Supplier updated successfully',
            data: {
                supplier: updatedSupplier
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/suppliers/:id
// @desc    Delete supplier (admin only)
// @access  Private/Admin
router.delete('/:id', authenticate, authorizeAdmin, validateObjectId('id'), async (req, res, next) => {
    try {
        const supplier = await Supplier.findById(req.params.id);

        if (!supplier) {
            return next(new AppError('Supplier not found', 404));
        }

        // Check if supplier has products
        const productsCount = await Product.countDocuments({ supplierId: req.params.id });
        if (productsCount > 0) {
            return next(new AppError(`Cannot delete supplier. It has ${productsCount} associated products.`, 400));
        }

        await Supplier.findByIdAndDelete(req.params.id);

        // Log supplier deletion to history
        await History.create({
            userId: req.user._id,
            actionType: 'supplier_deletion',
            description: `Admin ${req.user.fullName} deleted supplier: ${supplier.name}`,
            metadata: { supplierId: supplier._id },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: 'Supplier deleted successfully'
        });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/suppliers/:id/toggle-status
// @desc    Toggle supplier active status (admin only)
// @access  Private/Admin
router.put('/:id/toggle-status', authenticate, authorizeAdmin, validateObjectId('id'), async (req, res, next) => {
    try {
        const supplier = await Supplier.findById(req.params.id);

        if (!supplier) {
            return next(new AppError('Supplier not found', 404));
        }

        supplier.isActive = !supplier.isActive;
        await supplier.save();

        // Log status change to history
        await History.create({
            userId: req.user._id,
            actionType: 'supplier_status_change',
            description: `Admin ${req.user.fullName} ${supplier.isActive ? 'activated' : 'deactivated'} supplier: ${supplier.name}`,
            metadata: { supplierId: supplier._id, newStatus: supplier.isActive },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: `Supplier ${supplier.isActive ? 'activated' : 'deactivated'} successfully`,
            data: {
                supplier
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/suppliers/:id/products
// @desc    Get products by supplier
// @access  Public
router.get('/:id/products', optionalAuth, validateObjectId('id'), validatePagination, async (req, res, next) => {
    try {
        const supplier = await Supplier.findById(req.params.id);

        if (!supplier) {
            return next(new AppError('Supplier not found', 404));
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const products = await Product.find({
            supplierId: req.params.id,
            isActive: true
        })
            .populate('categoryId', 'name')
            .populate('supplierId', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Product.countDocuments({
            supplierId: req.params.id,
            isActive: true
        });

        res.json({
            success: true,
            data: {
                supplier,
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

