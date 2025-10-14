// Debug registration endpoint
const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

// Import models
const User = require('./models/User');

// Connect to MongoDB Atlas
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Atlas connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('MongoDB Atlas connection error:', error);
        process.exit(1);
    }
};

const testRegistration = async () => {
    await connectDB();

    console.log('🧪 Testing registration validation...\n');

    // Test data
    const testData = {
        email: 'testuser@example.com',
        password: 'password123',
        fullName: 'Test User'
    };

    console.log('Test data:', testData);

    // Manual validation
    const validationRules = [
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
            .withMessage('Full name must be between 2 and 100 characters')
    ];

    // Simulate validation
    const req = { body: testData };
    const res = { status: () => ({ json: (data) => console.log('Validation result:', data) }) };
    const next = () => console.log('Validation passed');

    // Check if user already exists
    try {
        const existingUser = await User.findOne({ email: testData.email });
        if (existingUser) {
            console.log('❌ User already exists with this email');
            return;
        }

        console.log('✅ Email is available');

        // Test creating user
        const user = new User({
            email: testData.email,
            password: testData.password,
            fullName: testData.fullName
        });

        await user.save();
        console.log('✅ User created successfully:', user.toJSON());

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.name === 'ValidationError') {
            console.log('Validation errors:', Object.values(error.errors).map(err => err.message));
        }
    }

    mongoose.connection.close();
};

testRegistration();

