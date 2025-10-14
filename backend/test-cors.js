// Test CORS and registration endpoint
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// CORS configuration
app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true
}));

app.use(express.json());

// Simple test endpoint
app.post('/api/test-registration', (req, res) => {
    console.log('Received registration request:', req.body);

    // Basic validation
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields',
            errors: [
                { field: 'email', message: !email ? 'Email is required' : null },
                { field: 'password', message: !password ? 'Password is required' : null },
                { field: 'fullName', message: !fullName ? 'Full name is required' : null }
            ].filter(e => e.message)
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'Password must be at least 6 characters long'
        });
    }

    if (fullName.length < 2) {
        return res.status(400).json({
            success: false,
            message: 'Full name must be at least 2 characters long'
        });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid email address'
        });
    }

    res.json({
        success: true,
        message: 'Registration data is valid',
        data: { email, fullName }
    });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
    console.log('Test with: curl -X POST http://localhost:3001/api/test-registration -H "Content-Type: application/json" -d \'{"email":"test@example.com","password":"password123","fullName":"Test User"}\'');
});

