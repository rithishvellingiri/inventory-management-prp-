const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');

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

connectDB();

const seedData = async () => {
    try {
        console.log('🌱 Starting database seeding...');

        // Clear existing data
        await User.deleteMany({});
        await Category.deleteMany({});
        await Supplier.deleteMany({});
        await Product.deleteMany({});

        console.log('🗑️  Cleared existing data');

        // Create admin user
        const adminUser = new User({
            email: 'admin@inventory.com',
            password: 'admin123',
            fullName: 'System Administrator',
            phone: '+1234567890',
            role: 'admin'
        });
        await adminUser.save();
        console.log('👤 Created admin user');

        // Create regular user
        const regularUser = new User({
            email: 'user@inventory.com',
            password: 'user123',
            fullName: 'John Doe',
            phone: '+1234567891',
            role: 'user'
        });
        await regularUser.save();
        console.log('👤 Created regular user');

        // Create categories
        const categories = [
            { name: 'Electronics', description: 'Electronic devices and gadgets' },
            { name: 'Clothing', description: 'Apparel and fashion items' },
            { name: 'Books', description: 'Books and educational materials' },
            { name: 'Home & Garden', description: 'Home improvement and garden supplies' },
            { name: 'Sports', description: 'Sports equipment and accessories' },
            { name: 'Beauty', description: 'Beauty and personal care products' }
        ];

        const createdCategories = await Category.insertMany(categories);
        console.log('📂 Created categories');

        // Create suppliers
        const suppliers = [
            {
                name: 'TechCorp Solutions',
                contact: '+1-555-0101',
                email: 'contact@techcorp.com',
                address: '123 Tech Street, Silicon Valley, CA 94000'
            },
            {
                name: 'Fashion Forward Ltd',
                contact: '+1-555-0102',
                email: 'orders@fashionforward.com',
                address: '456 Fashion Ave, New York, NY 10001'
            },
            {
                name: 'BookWorld Publishers',
                contact: '+1-555-0103',
                email: 'sales@bookworld.com',
                address: '789 Library Lane, Boston, MA 02101'
            },
            {
                name: 'Home Essentials Inc',
                contact: '+1-555-0104',
                email: 'info@homeessentials.com',
                address: '321 Home Street, Chicago, IL 60601'
            },
            {
                name: 'SportsMax Equipment',
                contact: '+1-555-0105',
                email: 'orders@sportsmax.com',
                address: '654 Sports Blvd, Los Angeles, CA 90210'
            }
        ];

        const createdSuppliers = await Supplier.insertMany(suppliers);
        console.log('🏢 Created suppliers');

        // Create products with relevant image paths (served by Angular app assets)
        const products = [
            {
                name: 'MacBook Pro 16"',
                categoryId: createdCategories[0]._id,
                supplierId: createdSuppliers[0]._id,
                price: 2499.99,
                stock: 25,
                description: 'High-performance laptop with M2 Pro chip, perfect for professionals',
                lowStockThreshold: 5,
                image: 'assets/laptop.png'
            },
            {
                name: 'iPhone 15 Pro',
                categoryId: createdCategories[0]._id,
                supplierId: createdSuppliers[0]._id,
                price: 999.99,
                stock: 50,
                description: 'Latest iPhone with advanced camera system and titanium design',
                lowStockThreshold: 10,
                image: 'assets/smartphone.png'
            },
            {
                name: 'Samsung Galaxy S24',
                categoryId: createdCategories[0]._id,
                supplierId: createdSuppliers[0]._id,
                price: 799.99,
                stock: 30,
                description: 'Android flagship with AI-powered features',
                lowStockThreshold: 8,
                image: 'assets/smartphone.png'
            },
            {
                name: 'Nike Air Max 270',
                categoryId: createdCategories[1]._id,
                supplierId: createdSuppliers[1]._id,
                price: 150.00,
                stock: 100,
                description: 'Comfortable running shoes with Max Air cushioning',
                lowStockThreshold: 20,
                image: 'assets/clothing.png'
            },
            {
                name: "Levi's 501 Jeans",
                categoryId: createdCategories[1]._id,
                supplierId: createdSuppliers[1]._id,
                price: 89.99,
                stock: 75,
                description: 'Classic straight-fit jeans, timeless style',
                lowStockThreshold: 15,
                image: 'assets/clothing.png'
            },
            {
                name: 'The Great Gatsby',
                categoryId: createdCategories[2]._id,
                supplierId: createdSuppliers[2]._id,
                price: 12.99,
                stock: 200,
                description: 'Classic American novel by F. Scott Fitzgerald',
                lowStockThreshold: 50,
                image: 'assets/book.png'
            },
            {
                name: 'JavaScript: The Good Parts',
                categoryId: createdCategories[2]._id,
                supplierId: createdSuppliers[2]._id,
                price: 29.99,
                stock: 45,
                description: 'Essential guide to JavaScript programming',
                lowStockThreshold: 10,
                image: 'assets/book.png'
            },
            {
                name: 'KitchenAid Stand Mixer',
                categoryId: createdCategories[3]._id,
                supplierId: createdSuppliers[3]._id,
                price: 399.99,
                stock: 15,
                description: 'Professional-grade stand mixer for baking enthusiasts',
                lowStockThreshold: 3,
                image: 'assets/mixer-grinder.png'
            },
            {
                name: 'Dyson V15 Vacuum',
                categoryId: createdCategories[3]._id,
                supplierId: createdSuppliers[3]._id,
                price: 649.99,
                stock: 20,
                description: 'Cordless vacuum with laser dust detection',
                lowStockThreshold: 5,
                image: 'assets/home-appliance.png'
            },
            {
                name: 'Wilson Pro Staff Tennis Racket',
                categoryId: createdCategories[4]._id,
                supplierId: createdSuppliers[4]._id,
                price: 199.99,
                stock: 30,
                description: 'Professional tennis racket for advanced players',
                lowStockThreshold: 8,
                image: 'assets/image.png'
            },
            {
                name: 'Yoga Mat Premium',
                categoryId: createdCategories[4]._id,
                supplierId: createdSuppliers[4]._id,
                price: 49.99,
                stock: 60,
                description: 'Non-slip yoga mat with carrying strap',
                lowStockThreshold: 12,
                image: 'assets/image.png'
            },
            {
                name: "L'Oréal Revitalift Cream",
                categoryId: createdCategories[5]._id,
                supplierId: createdSuppliers[1]._id,
                price: 24.99,
                stock: 80,
                description: 'Anti-aging face cream with hyaluronic acid',
                lowStockThreshold: 20,
                image: 'assets/image.png'
            }
        ];

        await Product.insertMany(products);
        console.log('📦 Created products');

        console.log('✅ Database seeding completed successfully!');
        console.log('\n📋 Sample Data Summary:');
        console.log(`👥 Users: 2 (1 admin, 1 regular)`);
        console.log(`📂 Categories: ${createdCategories.length}`);
        console.log(`🏢 Suppliers: ${createdSuppliers.length}`);
        console.log(`📦 Products: ${products.length}`);
        console.log('\n🔑 Login Credentials:');
        console.log('Admin: admin@inventory.com / admin123');
        console.log('User: user@inventory.com / user123');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        mongoose.connection.close();
    }
};

// Run seeding
seedData();
