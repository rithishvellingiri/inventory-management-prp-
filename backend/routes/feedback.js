const express = require('express');
const Feedback = require('../models/Feedback');
const Product = require('../models/Product');
const History = require('../models/History');
const { authenticate, authorizeAdmin, optionalAuth } = require('../middleware/auth');
const { validateFeedback, validateObjectId, validatePagination } = require('../middleware/validation');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

// @route   GET /api/feedback
// @desc    Get feedback (admin sees all, users see their own)
// @access  Private
router.get('/', authenticate, validatePagination, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = {};

        // Regular users can only see their own feedback
        if (req.user.role !== 'admin') {
            filter.userId = req.user._id;
        }

        // Admin filters
        if (req.user.role === 'admin') {
            if (req.query.userId) filter.userId = req.query.userId;
            if (req.query.type) filter.type = req.query.type;
            if (req.query.status) filter.status = req.query.status;
            if (req.query.productId) filter.productId = req.query.productId;
        }

        const feedback = await Feedback.find(filter)
            .populate('userId', 'fullName email')
            .populate('productId', 'name image')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Feedback.countDocuments(filter);

        res.json({
            success: true,
            data: {
                feedback,
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

// @route   GET /api/feedback/:id
// @desc    Get feedback by ID
// @access  Private
router.get('/:id', authenticate, validateObjectId('id'), async (req, res, next) => {
    try {
        const feedback = await Feedback.findById(req.params.id)
            .populate('userId', 'fullName email')
            .populate('productId', 'name image');

        if (!feedback) {
            return next(new AppError('Feedback not found', 404));
        }

        // Regular users can only see their own feedback
        if (req.user.role !== 'admin' && feedback.userId._id.toString() !== req.user._id.toString()) {
            return next(new AppError('Access denied', 403));
        }

        res.json({
            success: true,
            data: {
                feedback
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/feedback
// @desc    Create new feedback
// @access  Private
router.post('/', authenticate, validateFeedback, async (req, res, next) => {
    try {
        const { message, type, productId, rating } = req.body;

        // Verify product exists if productId is provided
        if (productId) {
            const product = await Product.findById(productId);
            if (!product) {
                return next(new AppError('Product not found', 404));
            }
        }

        const feedback = new Feedback({
            userId: req.user._id,
            productId,
            message,
            type,
            rating
        });

        await feedback.save();

        // Populate the created feedback
        await feedback.populate('userId', 'fullName email');
        if (productId) {
            await feedback.populate('productId', 'name image');
        }

        // Log feedback creation to history
        await History.create({
            userId: req.user._id,
            actionType: 'feedback_creation',
            description: `${req.user.fullName} submitted ${type} feedback`,
            metadata: {
                feedbackId: feedback._id,
                type,
                productId,
                rating
            },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully',
            data: {
                feedback
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/feedback/:id/reply
// @desc    Reply to feedback (admin only)
// @access  Private/Admin
router.put('/:id/reply', authenticate, authorizeAdmin, validateObjectId('id'), async (req, res, next) => {
    try {
        const { chatbotReply } = req.body;

        if (!chatbotReply || chatbotReply.trim().length === 0) {
            return next(new AppError('Reply message is required', 400));
        }

        if (chatbotReply.length > 500) {
            return next(new AppError('Reply message cannot exceed 500 characters', 400));
        }

        const feedback = await Feedback.findById(req.params.id);
        if (!feedback) {
            return next(new AppError('Feedback not found', 404));
        }

        feedback.chatbotReply = chatbotReply.trim();
        feedback.status = 'replied';
        await feedback.save();

        // Populate the updated feedback
        await feedback.populate('userId', 'fullName email');
        if (feedback.productId) {
            await feedback.populate('productId', 'name image');
        }

        // Log reply to history
        await History.create({
            userId: req.user._id,
            actionType: 'feedback_reply',
            description: `Admin ${req.user.fullName} replied to feedback from ${feedback.userId.fullName}`,
            metadata: {
                feedbackId: feedback._id,
                originalUserId: feedback.userId._id
            },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: 'Reply sent successfully',
            data: {
                feedback
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/feedback/:id/status
// @desc    Update feedback status (admin only)
// @access  Private/Admin
router.put('/:id/status', authenticate, authorizeAdmin, validateObjectId('id'), async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!['pending', 'replied', 'resolved'].includes(status)) {
            return next(new AppError('Invalid status. Must be pending, replied, or resolved', 400));
        }

        const feedback = await Feedback.findById(req.params.id);
        if (!feedback) {
            return next(new AppError('Feedback not found', 404));
        }

        const oldStatus = feedback.status;
        feedback.status = status;
        await feedback.save();

        // Log status change to history
        await History.create({
            userId: req.user._id,
            actionType: 'feedback_status_change',
            description: `Admin ${req.user.fullName} changed feedback status from ${oldStatus} to ${status}`,
            metadata: {
                feedbackId: feedback._id,
                oldStatus,
                newStatus: status
            },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: 'Feedback status updated successfully',
            data: {
                feedback: feedback.toJSON()
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/feedback/:id
// @desc    Delete feedback (admin only)
// @access  Private/Admin
router.delete('/:id', authenticate, authorizeAdmin, validateObjectId('id'), async (req, res, next) => {
    try {
        const feedback = await Feedback.findById(req.params.id);

        if (!feedback) {
            return next(new AppError('Feedback not found', 404));
        }

        await Feedback.findByIdAndDelete(req.params.id);

        // Log feedback deletion to history
        await History.create({
            userId: req.user._id,
            actionType: 'feedback_deletion',
            description: `Admin ${req.user.fullName} deleted feedback from ${feedback.userId}`,
            metadata: { feedbackId: feedback._id },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: 'Feedback deleted successfully'
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/feedback/stats/overview
// @desc    Get feedback statistics (admin only)
// @access  Private/Admin
router.get('/stats/overview', authenticate, authorizeAdmin, async (req, res, next) => {
    try {
        const totalFeedback = await Feedback.countDocuments();
        const pendingFeedback = await Feedback.countDocuments({ status: 'pending' });
        const repliedFeedback = await Feedback.countDocuments({ status: 'replied' });
        const resolvedFeedback = await Feedback.countDocuments({ status: 'resolved' });

        const feedbackByType = await Feedback.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]);

        const feedbackByRating = await Feedback.aggregate([
            { $match: { rating: { $exists: true } } },
            { $group: { _id: '$rating', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        // Get recent feedback (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentFeedback = await Feedback.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        res.json({
            success: true,
            data: {
                totalFeedback,
                pendingFeedback,
                repliedFeedback,
                resolvedFeedback,
                feedbackByType,
                feedbackByRating,
                recentFeedback
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

