const express = require('express');
const User = require('../models/User');
const History = require('../models/History');
const { generateToken, authenticate } = require('../middleware/auth');
const { validateUserRegistration, validateUserLogin } = require('../middleware/validation');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateUserRegistration, async (req, res, next) => {
    try {
        const { email, password, fullName, phone } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new AppError('Email already exists', 400));
        }

        // Create new user
        const user = new User({
            email,
            password,
            fullName,
            phone
        });

        await user.save();

        // Log registration to history
        await History.create({
            userId: user._id,
            actionType: 'user_registration',
            description: `New user registered: ${user.fullName} (${user.email})`,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user: user.toJSON(),
                token
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateUserLogin, async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user and include password for comparison
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return next(new AppError('Invalid email or password', 401));
        }

        // Check if user is active
        if (!user.isActive) {
            return next(new AppError('Account is deactivated', 401));
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return next(new AppError('Invalid email or password', 401));
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Log login to history
        await History.create({
            userId: user._id,
            actionType: 'login',
            description: `${user.fullName} logged in`,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: user.toJSON(),
                token
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticate, async (req, res, next) => {
    try {
        // Log logout to history
        await History.create({
            userId: req.user._id,
            actionType: 'logout',
            description: `${req.user.fullName} logged out`,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticate, async (req, res, next) => {
    try {
        res.json({
            success: true,
            data: {
                user: req.user
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticate, async (req, res, next) => {
    try {
        const { fullName, phone } = req.body;
        const allowedUpdates = { fullName, phone };

        // Remove undefined values
        Object.keys(allowedUpdates).forEach(key =>
            allowedUpdates[key] === undefined && delete allowedUpdates[key]
        );

        const user = await User.findByIdAndUpdate(
            req.user._id,
            allowedUpdates,
            { new: true, runValidators: true }
        );

        // Log profile update to history
        await History.create({
            userId: user._id,
            actionType: 'profile_update',
            description: `${user.fullName} updated their profile`,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: user.toJSON()
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', authenticate, async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return next(new AppError('Current password and new password are required', 400));
        }

        if (newPassword.length < 6) {
            return next(new AppError('New password must be at least 6 characters long', 400));
        }

        // Find user with password
        const user = await User.findById(req.user._id).select('+password');

        // Check current password
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return next(new AppError('Current password is incorrect', 400));
        }

        // Update password
        user.password = newPassword;
        await user.save();

        // Log password change to history
        await History.create({
            userId: user._id,
            actionType: 'password_change',
            description: `${user.fullName} changed their password`,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

