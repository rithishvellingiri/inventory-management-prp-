const express = require('express');
const History = require('../models/History');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { validateObjectId, validatePagination } = require('../middleware/validation');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

// @route   GET /api/history
// @desc    Get history logs (admin sees all, users see their own)
// @access  Private
router.get('/', authenticate, validatePagination, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = {};

        // Regular users can only see their own history
        if (req.user.role !== 'admin') {
            filter.userId = req.user._id;
        }

        // Admin filters
        if (req.user.role === 'admin') {
            if (req.query.userId) filter.userId = req.query.userId;
            if (req.query.actionType) filter.actionType = req.query.actionType;
            if (req.query.startDate && req.query.endDate) {
                filter.createdAt = {
                    $gte: new Date(req.query.startDate),
                    $lte: new Date(req.query.endDate)
                };
            }
        }

        const history = await History.find(filter)
            .populate('userId', 'fullName email role')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await History.countDocuments(filter);

        res.json({
            success: true,
            data: {
                history,
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

// @route   GET /api/history/:id
// @desc    Get history entry by ID
// @access  Private
router.get('/:id', authenticate, validateObjectId('id'), async (req, res, next) => {
    try {
        const historyEntry = await History.findById(req.params.id)
            .populate('userId', 'fullName email role');

        if (!historyEntry) {
            return next(new AppError('History entry not found', 404));
        }

        // Regular users can only see their own history
        if (req.user.role !== 'admin' && historyEntry.userId && historyEntry.userId._id.toString() !== req.user._id.toString()) {
            return next(new AppError('Access denied', 403));
        }

        res.json({
            success: true,
            data: {
                history: historyEntry
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/history/stats/overview
// @desc    Get history statistics (admin only)
// @access  Private/Admin
router.get('/stats/overview', authenticate, authorizeAdmin, async (req, res, next) => {
    try {
        const totalEntries = await History.countDocuments();

        // Get activity by action type
        const activityByType = await History.aggregate([
            { $group: { _id: '$actionType', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Get activity by user
        const activityByUser = await History.aggregate([
            { $match: { userId: { $exists: true } } },
            { $group: { _id: '$userId', count: { $sum: 1 } } },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
            { $unwind: '$user' },
            { $project: { _id: 1, count: 1, userName: '$user.fullName', userRole: '$user.role' } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Get recent activity (last 24 hours)
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
        const recentActivity = await History.countDocuments({
            createdAt: { $gte: twentyFourHoursAgo }
        });

        // Get activity by day (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const activityByDay = await History.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);

        res.json({
            success: true,
            data: {
                totalEntries,
                recentActivity,
                activityByType,
                activityByUser,
                activityByDay
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/history/cleanup
// @desc    Clean up old history entries (admin only)
// @access  Private/Admin
router.delete('/cleanup', authenticate, authorizeAdmin, async (req, res, next) => {
    try {
        const { daysToKeep = 90 } = req.body;

        if (daysToKeep < 30) {
            return next(new AppError('Cannot delete history entries newer than 30 days', 400));
        }

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        const result = await History.deleteMany({
            createdAt: { $lt: cutoffDate }
        });

        // Log cleanup action
        await History.create({
            userId: req.user._id,
            actionType: 'history_cleanup',
            description: `Admin ${req.user.fullName} cleaned up ${result.deletedCount} history entries older than ${daysToKeep} days`,
            metadata: {
                deletedCount: result.deletedCount,
                cutoffDate,
                daysToKeep
            },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: `Cleaned up ${result.deletedCount} history entries`,
            data: {
                deletedCount: result.deletedCount,
                cutoffDate
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/history/export
// @desc    Export history data (admin only)
// @access  Private/Admin
router.get('/export', authenticate, authorizeAdmin, async (req, res, next) => {
    try {
        const { startDate, endDate, format = 'json' } = req.query;

        const filter = {};
        if (startDate && endDate) {
            filter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const history = await History.find(filter)
            .populate('userId', 'fullName email role')
            .sort({ createdAt: -1 });

        if (format === 'csv') {
            // Convert to CSV format
            const csvHeader = 'Date,User,Action,Description,IP Address\n';
            const csvData = history.map(entry => {
                const date = entry.createdAt.toISOString();
                const user = entry.userId ? `${entry.userId.fullName} (${entry.userId.email})` : 'System';
                const action = entry.actionType;
                const description = entry.description.replace(/,/g, ';'); // Replace commas to avoid CSV issues
                const ip = entry.ipAddress || '';
                return `${date},${user},${action},${description},${ip}`;
            }).join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=history-export.csv');
            res.send(csvHeader + csvData);
        } else {
            // Return JSON format
            res.json({
                success: true,
                data: {
                    history,
                    exportInfo: {
                        totalEntries: history.length,
                        startDate: startDate || 'All time',
                        endDate: endDate || 'All time',
                        exportedAt: new Date().toISOString()
                    }
                }
            });
        }

        // Log export action
        await History.create({
            userId: req.user._id,
            actionType: 'history_export',
            description: `Admin ${req.user.fullName} exported history data (${history.length} entries)`,
            metadata: {
                entryCount: history.length,
                format,
                startDate,
                endDate
            },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

