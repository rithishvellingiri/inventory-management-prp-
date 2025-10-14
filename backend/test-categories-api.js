// Test categories API endpoint
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testCategoriesAPI() {
    console.log('🧪 Testing Categories API...\n');

    try {
        // Test 1: Get all categories
        console.log('1. Testing GET /api/categories...');
        const response = await axios.get(`${BASE_URL}/categories`);

        console.log('✅ Categories API Response:');
        console.log('   Status:', response.status);
        console.log('   Success:', response.data.success);
        console.log('   Categories count:', response.data.data.categories.length);

        if (response.data.data.categories.length > 0) {
            console.log('   Sample categories:');
            response.data.data.categories.slice(0, 3).forEach((cat, index) => {
                console.log(`     ${index + 1}. ID: ${cat._id}, Name: ${cat.name}`);
            });
        } else {
            console.log('   ⚠️  No categories found!');
        }

        // Test 2: Check data structure
        console.log('\n2. Checking data structure...');
        if (response.data.data.categories.length > 0) {
            const firstCategory = response.data.data.categories[0];
            console.log('   First category structure:');
            console.log('     _id:', firstCategory._id ? '✅ Present' : '❌ Missing');
            console.log('     name:', firstCategory.name ? '✅ Present' : '❌ Missing');
            console.log('     description:', firstCategory.description ? '✅ Present' : '❌ Missing');
            console.log('     createdAt:', firstCategory.createdAt ? '✅ Present' : '❌ Missing');
        }

        // Test 3: Test with authentication (if needed)
        console.log('\n3. Testing with admin login...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@inventory.com',
            password: 'admin123'
        });

        if (loginResponse.data.success) {
            console.log('✅ Admin login successful');
            const token = loginResponse.data.data.token;

            // Test categories with auth header
            const authResponse = await axios.get(`${BASE_URL}/categories`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('✅ Categories with auth:', authResponse.data.data.categories.length, 'categories');
        }

    } catch (error) {
        console.error('❌ Categories API test failed:', error.response?.data || error.message);

        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Make sure your backend server is running:');
            console.log('   cd backend && npm run dev');
        }
    }
}

testCategoriesAPI();

