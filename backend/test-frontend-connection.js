// Simple test to verify frontend-backend connection
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testFrontendBackendConnection() {
    console.log('🧪 Testing Frontend-Backend Connection...\n');

    try {
        // Test 1: Health Check
        console.log('1. Testing health endpoint...');
        const health = await axios.get(`${BASE_URL}/health`);
        console.log('✅ Health check passed:', health.data.status);

        // Test 2: Login with seeded admin account
        console.log('\n2. Testing admin login...');
        const login = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@inventory.com',
            password: 'admin123'
        });
        console.log('✅ Admin login successful');
        console.log('   User:', login.data.data.user.fullName);
        console.log('   Role:', login.data.data.user.role);
        console.log('   Token received:', login.data.data.token ? 'Yes' : 'No');

        const token = login.data.data.token;

        // Test 3: Test protected endpoint
        console.log('\n3. Testing protected endpoint...');
        const me = await axios.get(`${BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Protected endpoint successful');
        console.log('   Current user:', me.data.data.user.fullName);

        // Test 4: Test products endpoint
        console.log('\n4. Testing products endpoint...');
        const products = await axios.get(`${BASE_URL}/products`);
        console.log('✅ Products endpoint successful');
        console.log('   Products count:', products.data.data.products.length);

        // Test 5: Test categories endpoint
        console.log('\n5. Testing categories endpoint...');
        const categories = await axios.get(`${BASE_URL}/categories`);
        console.log('✅ Categories endpoint successful');
        console.log('   Categories count:', categories.data.data.categories.length);

        console.log('\n🎉 All tests passed! Your frontend should now be able to connect to the backend.');
        console.log('\n📋 Next steps:');
        console.log('1. Make sure your Angular frontend is running (ng serve)');
        console.log('2. Try logging in with: admin@inventory.com / admin123');
        console.log('3. Check browser console for any CORS errors');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);

        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Make sure your backend server is running:');
            console.log('   cd backend && npm run dev');
        }

        if (error.response?.status === 401) {
            console.log('\n💡 Make sure you have seeded the database:');
            console.log('   cd backend && npm run seed');
        }
    }
}

testFrontendBackendConnection();

