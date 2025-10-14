const express = require('express');
const User = require('../models/User');
const History = require('../models/History');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { validateObjectId, validatePagination } = require('../middleware/validation');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', authenticate, authorizeAdmin, validatePagination, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = {};
        if (req.query.role) filter.role = req.query.role;
        if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

        const users = await User.find(filter)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments(filter);

        res.json({
            success: true,
            data: {
                users,
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

// @route   GET /api/users/:id
// @desc    Get user by ID (admin only)
// @access  Private/Admin
router.get('/:id', authenticate, authorizeAdmin, validateObjectId('id'), async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return next(new AppError('User not found', 404));
        }

        res.json({
            success: true,
            data: {
                user
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/users/:id
// @desc    Update user (admin only)
// @access  Private/Admin
router.put('/:id', authenticate, authorizeAdmin, validateObjectId('id'), async (req, res, next) => {
    try {
        const { fullName, phone, role, isActive } = req.body;
        const allowedUpdates = { fullName, phone, role, isActive };

        // Remove undefined values
        Object.keys(allowedUpdates).forEach(key =>
            allowedUpdates[key] === undefined && delete allowedUpdates[key]
        );

        // Validate role if provided
        if (role && !['admin', 'user'].includes(role)) {
            return next(new AppError('Invalid role. Must be admin or user', 400));
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            allowedUpdates,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return next(new AppError('User not found', 404));
        }

        // Log user update to history
        await History.create({
            userId: req.user._id,
            actionType: 'user_update',
            description: `Admin ${req.user.fullName} updated user ${user.fullName}`,
            metadata: { updatedUserId: user._id, changes: allowedUpdates },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: 'User updated successfully',
            data: {
                user
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (admin only)
// @access  Private/Admin
router.delete('/:id', authenticate, authorizeAdmin, validateObjectId('id'), async (req, res, next) => {
    try {
        // Prevent admin from deleting themselves
        if (req.params.id === req.user._id.toString()) {
            return next(new AppError('You cannot delete your own account', 400));
        }

        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return next(new AppError('User not found', 404));
        }

        // Log user deletion to history
        await History.create({
            userId: req.user._id,
            actionType: 'user_deletion',
            description: `Admin ${req.user.fullName} deleted user ${user.fullName}`,
            metadata: { deletedUserId: user._id },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/users/:id/toggle-status
// @desc    Toggle user active status (admin only)
// @access  Private/Admin
router.put('/:id/toggle-status', authenticate, authorizeAdmin, validateObjectId('id'), async (req, res, next) => {
    try {
        // Prevent admin from deactivating themselves
        if (req.params.id === req.user._id.toString()) {
            return next(new AppError('You cannot deactivate your own account', 400));
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return next(new AppError('User not found', 404));
        }

        user.isActive = !user.isActive;
        await user.save();

        // Log status change to history
        await History.create({
            userId: req.user._id,
            actionType: 'user_status_change',
            description: `Admin ${req.user.fullName} ${user.isActive ? 'activated' : 'deactivated'} user ${user.fullName}`,
            metadata: { targetUserId: user._id, newStatus: user.isActive },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
            data: {
                user: user.toJSON()
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/users/stats/overview
// @desc    Get user statistics (admin only)
// @access  Private/Admin
router.get('/stats/overview', authenticate, authorizeAdmin, async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const adminUsers = await User.countDocuments({ role: 'admin' });
        const regularUsers = await User.countDocuments({ role: 'user' });

        // Get recent registrations (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentRegistrations = await User.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        res.json({
            success: true,
            data: {
                totalUsers,
                activeUsers,
                inactiveUsers: totalUsers - activeUsers,
                adminUsers,
                regularUsers,
                recentRegistrations
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

