const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

<<<<<<< HEAD
// CORS configuration
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:4200',
    'https://inventory-maanagement-prp.vercel.app',
    'https://inventory-maanagement-prp.vercel.app'
];

=======
// CORS
>>>>>>> 19510cb (project updated)
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Static files
app.use('/uploads', express.static('uploads'));

const User = require('./models/User');

// ✅ FIXED DATABASE CONNECTION
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`✅ MongoDB Atlas connected: ${conn.connection.host}`);
        
        // Auto-seed if database is empty
        try {
            const userCount = await User.countDocuments();
            if (userCount === 0) {
                console.log('📦 Database is empty. Running seed script...');
                const { execSync } = require('child_process');
                execSync('node scripts/seed.js', { stdio: 'inherit', cwd: __dirname });
                console.log('✅ Auto-seeding completed.');
            }
        } catch (seedError) {
            console.error('❌ Error during auto-seeding:', seedError.message);
        }
    } catch (error) {
        console.error('❌ MongoDB Atlas connection error:', error.message);
        process.exit(1);
    }
};

connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/suppliers', require('./routes/suppliers'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/history', require('./routes/history'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// 404
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;