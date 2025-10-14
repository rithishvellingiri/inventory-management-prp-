// Test all database connections and collections
const mongoose = require('mongoose');
require('dotenv').config();

// Import all models
const User = require('./models/User');
const Category = require('./models/Category');
const Supplier = require('./models/Supplier');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Cart = require('./models/Cart');
const Feedback = require('./models/Feedback');
const History = require('./models/History');

const testDatabaseConnections = async () => {
    console.log('🧪 Testing Database Connections and Collections...\n');

    try {
        // Connect to MongoDB Atlas
        console.log('1. Connecting to MongoDB Atlas...');
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`✅ Connected to: ${conn.connection.host}`);
        console.log(`   Database: ${conn.connection.name}\n`);

        // Test all collections
        const collections = [
            { name: 'Users', model: User },
            { name: 'Categories', model: Category },
            { name: 'Suppliers', model: Supplier },
            { name: 'Products', model: Product },
            { name: 'Orders', model: Order },
            { name: 'Cart', model: Cart },
            { name: 'Feedback', model: Feedback },
            { name: 'History', model: History }
        ];

        console.log('2. Testing Collections...');
        for (const collection of collections) {
            try {
                const count = await collection.model.countDocuments();
                console.log(`✅ ${collection.name}: ${count} documents`);
            } catch (error) {
                console.log(`❌ ${collection.name}: Error - ${error.message}`);
            }
        }

        console.log('\n3. Testing Sample Queries...');

        // Test Users
        const userCount = await User.countDocuments();
        console.log(`✅ Users: ${userCount} total`);
        if (userCount > 0) {
            const adminUser = await User.findOne({ role: 'admin' });
            console.log(`   Admin user: ${adminUser ? adminUser.email : 'Not found'}`);
        }

        // Test Categories
        const categoryCount = await Category.countDocuments();
        console.log(`✅ Categories: ${categoryCount} total`);
        if (categoryCount > 0) {
            const categories = await Category.find().limit(3);
            console.log(`   Sample categories: ${categories.map(c => c.name).join(', ')}`);
        }

        // Test Suppliers
        const supplierCount = await Supplier.countDocuments();
        console.log(`✅ Suppliers: ${supplierCount} total`);
        if (supplierCount > 0) {
            const suppliers = await Supplier.find().limit(3);
            console.log(`   Sample suppliers: ${suppliers.map(s => s.name).join(', ')}`);
        }

        // Test Products
        const productCount = await Product.countDocuments();
        console.log(`✅ Products: ${productCount} total`);
        if (productCount > 0) {
            const products = await Product.find().populate('categoryId', 'name').populate('supplierId', 'name').limit(3);
            console.log(`   Sample products: ${products.map(p => p.name).join(', ')}`);
        }

        // Test Orders
        const orderCount = await Order.countDocuments();
        console.log(`✅ Orders: ${orderCount} total`);

        // Test Cart
        const cartCount = await Cart.countDocuments();
        console.log(`✅ Cart: ${cartCount} total`);

        // Test Feedback
        const feedbackCount = await Feedback.countDocuments();
        console.log(`✅ Feedback: ${feedbackCount} total`);

        // Test History
        const historyCount = await History.countDocuments();
        console.log(`✅ History: ${historyCount} total`);

        console.log('\n4. Testing Relationships...');

        // Test Product-Category relationship
        if (productCount > 0 && categoryCount > 0) {
            const productWithCategory = await Product.findOne().populate('categoryId', 'name');
            if (productWithCategory && productWithCategory.categoryId) {
                console.log(`✅ Product-Category relationship: "${productWithCategory.name}" belongs to "${productWithCategory.categoryId.name}"`);
            }
        }

        // Test Product-Supplier relationship
        if (productCount > 0 && supplierCount > 0) {
            const productWithSupplier = await Product.findOne().populate('supplierId', 'name');
            if (productWithSupplier && productWithSupplier.supplierId) {
                console.log(`✅ Product-Supplier relationship: "${productWithSupplier.name}" supplied by "${productWithSupplier.supplierId.name}"`);
            }
        }

        console.log('\n5. Testing Indexes...');

        // Get collection stats
        const db = mongoose.connection.db;
        const collectionsList = await db.listCollections().toArray();

        for (const collectionInfo of collectionsList) {
            const collectionName = collectionInfo.name;
            const stats = await db.collection(collectionName).stats();
            console.log(`✅ ${collectionName}: ${stats.count} documents, ${stats.indexes} indexes`);
        }

        console.log('\n🎉 All database connections and collections are working correctly!');
        console.log('\n📋 Summary:');
        console.log(`   Database: ${conn.connection.name}`);
        console.log(`   Collections: ${collectionsList.length}`);
        console.log(`   Total Documents: ${userCount + categoryCount + supplierCount + productCount + orderCount + cartCount + feedbackCount + historyCount}`);

        if (productCount === 0) {
            console.log('\n⚠️  No products found. Run the seed script:');
            console.log('   npm run seed');
        }

    } catch (error) {
        console.error('❌ Database connection test failed:', error.message);

        if (error.message.includes('ECONNREFUSED')) {
            console.log('\n💡 Make sure MongoDB Atlas is accessible and your connection string is correct.');
        }

        if (error.message.includes('Authentication failed')) {
            console.log('\n💡 Check your MongoDB Atlas username and password.');
        }

        if (error.message.includes('getaddrinfo ENOTFOUND')) {
            console.log('\n💡 Check your MongoDB Atlas cluster name and connection string.');
        }
    } finally {
        mongoose.connection.close();
    }
};

testDatabaseConnections();

