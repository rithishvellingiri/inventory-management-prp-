const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const History = require('../models/History');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { validateOrder, validateObjectId, validatePagination } = require('../middleware/validation');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

// @route   GET /api/orders
// @desc    Get user's orders or all orders (admin)
// @access  Private
router.get('/', authenticate, validatePagination, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = {};

        // Regular users can only see their own orders
        if (req.user.role !== 'admin') {
            filter.userId = req.user._id;
        }

        // Admin filters
        if (req.user.role === 'admin') {
            if (req.query.userId) filter.userId = req.query.userId;
            if (req.query.status) filter.status = req.query.status;
            if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
        }

        const orders = await Order.find(filter)
            .populate('userId', 'fullName email')
            .populate('items.productId', 'name image')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Order.countDocuments(filter);

        res.json({
            success: true,
            data: {
                orders,
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

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', authenticate, validateObjectId('id'), async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('userId', 'fullName email')
            .populate('items.productId', 'name image');

        if (!order) {
            return next(new AppError('Order not found', 404));
        }

        // Regular users can only see their own orders
        if (req.user.role !== 'admin' && order.userId._id.toString() !== req.user._id.toString()) {
            return next(new AppError('Access denied', 403));
        }

        res.json({
            success: true,
            data: {
                order
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', authenticate, validateOrder, async (req, res, next) => {
    try {
        const { items, totalAmount, paymentId, shippingAddress, notes } = req.body;

        // Verify all products exist and are active
        const productIds = items.map(item => item.productId);
        const products = await Product.find({
            _id: { $in: productIds },
            isActive: true
        });

        if (products.length !== productIds.length) {
            return next(new AppError('One or more products not found or inactive', 400));
        }

        // Check stock availability and calculate actual total
        let calculatedTotal = 0;
        const orderItems = [];

        for (const item of items) {
            const product = products.find(p => p._id.toString() === item.productId);

            if (product.stock < item.quantity) {
                return next(new AppError(`Insufficient stock for ${product.name}. Available: ${product.stock}`, 400));
            }

            const itemTotal = product.price * item.quantity;
            calculatedTotal += itemTotal;

            orderItems.push({
                productId: item.productId,
                quantity: item.quantity,
                price: product.price
            });
        }

        // Verify total amount matches calculated total
        if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
            return next(new AppError('Total amount mismatch', 400));
        }

        // Create order
        const order = new Order({
            userId: req.user._id,
            items: orderItems,
            totalAmount: calculatedTotal,
            paymentId,
            shippingAddress,
            notes
        });

        await order.save();

        // Update product stock
        for (const item of orderItems) {
            await Product.findByIdAndUpdate(
                item.productId,
                { $inc: { stock: -item.quantity } }
            );
        }

        // Clear user's cart
        await Cart.findOneAndUpdate(
            { userId: req.user._id },
            { items: [] }
        );

        // Populate the created order
        await order.populate('userId', 'fullName email');
        await order.populate('items.productId', 'name image');

        // Log order creation to history
        await History.create({
            userId: req.user._id,
            actionType: 'order_creation',
            description: `${req.user.fullName} created order #${order._id}`,
            metadata: {
                orderId: order._id,
                totalAmount: order.totalAmount,
                itemCount: order.items.length
            },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: {
                order
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (admin only)
// @access  Private/Admin
router.put('/:id/status', authenticate, authorizeAdmin, validateObjectId('id'), async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!['processing', 'completed', 'cancelled'].includes(status)) {
            return next(new AppError('Invalid status. Must be processing, completed, or cancelled', 400));
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return next(new AppError('Order not found', 404));
        }

        const oldStatus = order.status;
        order.status = status;
        await order.save();

        // If order is cancelled, restore stock
        if (status === 'cancelled' && oldStatus !== 'cancelled') {
            for (const item of order.items) {
                await Product.findByIdAndUpdate(
                    item.productId,
                    { $inc: { stock: item.quantity } }
                );
            }
        }

        // Log status change to history
        await History.create({
            userId: req.user._id,
            actionType: 'order_status_change',
            description: `Admin ${req.user.fullName} changed order #${order._id} status from ${oldStatus} to ${status}`,
            metadata: {
                orderId: order._id,
                oldStatus,
                newStatus: status
            },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: 'Order status updated successfully',
            data: {
                order: order.toJSON()
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/orders/:id/payment-status
// @desc    Update payment status (admin only)
// @access  Private/Admin
router.put('/:id/payment-status', authenticate, authorizeAdmin, validateObjectId('id'), async (req, res, next) => {
    try {
        const { paymentStatus } = req.body;

        if (!['pending', 'success', 'failed'].includes(paymentStatus)) {
            return next(new AppError('Invalid payment status. Must be pending, success, or failed', 400));
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return next(new AppError('Order not found', 404));
        }

        const oldPaymentStatus = order.paymentStatus;
        order.paymentStatus = paymentStatus;
        await order.save();

        // Log payment status change to history
        await History.create({
            userId: req.user._id,
            actionType: 'payment_status_change',
            description: `Admin ${req.user.fullName} changed order #${order._id} payment status from ${oldPaymentStatus} to ${paymentStatus}`,
            metadata: {
                orderId: order._id,
                oldPaymentStatus,
                newPaymentStatus: paymentStatus
            },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: 'Payment status updated successfully',
            data: {
                order: order.toJSON()
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/orders/stats/overview
// @desc    Get order statistics (admin only)
// @access  Private/Admin
router.get('/stats/overview', authenticate, authorizeAdmin, async (req, res, next) => {
    try {
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'processing' });
        const completedOrders = await Order.countDocuments({ status: 'completed' });
        const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

        // Get total revenue
        const revenueStats = await Order.aggregate([
            { $match: { paymentStatus: 'success', status: 'completed' } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
        ]);

        // Get recent orders (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentOrders = await Order.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        res.json({
            success: true,
            data: {
                totalOrders,
                pendingOrders,
                completedOrders,
                cancelledOrders,
                totalRevenue: revenueStats[0]?.totalRevenue || 0,
                recentOrders
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

