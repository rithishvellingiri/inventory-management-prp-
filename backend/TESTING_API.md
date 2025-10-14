# API Testing Guide

This guide provides various ways to test your Inventory Management System API, with specific instructions for Windows users.

## Windows-Compatible Commands

### Option 1: Single-Line Commands (Windows CMD/PowerShell)

#### Health Check
```cmd
curl http://localhost:3000/api/health
```

#### User Registration
```cmd
curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"password123\",\"fullName\":\"Test User\"}"
```

#### User Login
```cmd
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@inventory.com\",\"password\":\"admin123\"}"
```

### Option 2: PowerShell with Here-String

#### User Registration (PowerShell)
```powershell
$body = @{
    email = "test@example.com"
    password = "password123"
    fullName = "Test User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

#### User Login (PowerShell)
```powershell
$body = @{
    email = "admin@inventory.com"
    password = "admin123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```

### Option 3: Using Postman (Recommended)

1. **Download Postman**: [https://www.postman.com/downloads/](https://www.postman.com/downloads/)

2. **Create a new collection** called "Inventory Management API"

3. **Add requests**:

#### Health Check Request
- **Method**: GET
- **URL**: `http://localhost:3000/api/health`

#### Register User Request
- **Method**: POST
- **URL**: `http://localhost:3000/api/auth/register`
- **Headers**: 
  - `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
  "email": "test@example.com",
  "password": "password123",
  "fullName": "Test User"
}
```

#### Login Request
- **Method**: POST
- **URL**: `http://localhost:3000/api/auth/login`
- **Headers**: 
  - `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
  "email": "admin@inventory.com",
  "password": "admin123"
}
```

### Option 4: Using Thunder Client (VS Code Extension)

1. **Install Thunder Client** extension in VS Code
2. **Open Thunder Client** from VS Code sidebar
3. **Create requests** similar to Postman

### Option 5: Using HTTPie (Cross-platform)

1. **Install HTTPie**:
```cmd
pip install httpie
```

2. **Test API**:
```cmd
# Health check
http GET localhost:3000/api/health

# Register user
http POST localhost:3000/api/auth/register email=test@example.com password=password123 fullName="Test User"

# Login
http POST localhost:3000/api/auth/login email=admin@inventory.com password=admin123
```

## Complete API Testing Workflow

### Step 1: Start Your Server
```cmd
cd backend
npm run dev
```

### Step 2: Test Health Endpoint
```cmd
curl http://localhost:3000/api/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.456
}
```

### Step 3: Register a New User
```cmd
curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"newuser@example.com\",\"password\":\"password123\",\"fullName\":\"New User\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "...",
      "email": "newuser@example.com",
      "fullName": "New User",
      "role": "user",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Step 4: Login with Existing User
```cmd
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@inventory.com\",\"password\":\"admin123\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "email": "admin@inventory.com",
      "fullName": "System Administrator",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Step 5: Test Protected Endpoints

#### Get Current User (requires token)
```cmd
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" http://localhost:3000/api/auth/me
```

#### Get All Products
```cmd
curl http://localhost:3000/api/products
```

#### Get All Categories
```cmd
curl http://localhost:3000/api/categories
```

## Testing with Sample Data

If you've run the seed script (`npm run seed`), you can test with these pre-created accounts:

### Admin Account
- **Email**: `admin@inventory.com`
- **Password**: `admin123`
- **Role**: Admin (full access)

### Regular User Account
- **Email**: `user@inventory.com`
- **Password**: `user123`
- **Role**: User (limited access)

## Common Issues and Solutions

### Issue 1: JSON Parsing Error
**Error**: `Unexpected token ''', "'{" is not valid JSON`

**Solution**: Use single-line commands or escape quotes properly:
```cmd
curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"password123\",\"fullName\":\"Test User\"}"
```

### Issue 2: Connection Refused
**Error**: `curl: (7) Failed to connect to localhost port 3000`

**Solution**: 
1. Make sure your server is running (`npm run dev`)
2. Check if port 3000 is available
3. Verify MongoDB Atlas connection

### Issue 3: Authentication Failed
**Error**: `Invalid email or password`

**Solution**:
1. Use the correct credentials from seed data
2. Make sure you've run `npm run seed`
3. Check if user exists in database

### Issue 4: CORS Error
**Error**: `Access to fetch at 'http://localhost:3000/api/auth/login' from origin 'http://localhost:4200' has been blocked by CORS policy`

**Solution**: Update `FRONTEND_URL` in your `.env` file to match your frontend URL.

## Advanced Testing

### Testing with Authentication Token

1. **Login and get token**:
```cmd
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@inventory.com\",\"password\":\"admin123\"}"
```

2. **Copy the token** from the response

3. **Use token in subsequent requests**:
```cmd
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" http://localhost:3000/api/users
```

### Testing Admin-Only Endpoints

#### Create a New Category (Admin only)
```cmd
curl -X POST http://localhost:3000/api/categories -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_ADMIN_TOKEN" -d "{\"name\":\"Electronics\",\"description\":\"Electronic devices and gadgets\"}"
```

#### Create a New Product (Admin only)
```cmd
curl -X POST http://localhost:3000/api/products -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_ADMIN_TOKEN" -d "{\"name\":\"Test Product\",\"categoryId\":\"CATEGORY_ID\",\"supplierId\":\"SUPPLIER_ID\",\"price\":99.99,\"stock\":50,\"description\":\"Test product description\"}"
```

## Automated Testing Script

Create a test script for easier testing:

### test-api.js
```javascript
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testAPI() {
  try {
    // Test health endpoint
    console.log('Testing health endpoint...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', health.data);

    // Test registration
    console.log('Testing user registration...');
    const register = await axios.post(`${BASE_URL}/auth/register`, {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User'
    });
    console.log('✅ Registration successful:', register.data);

    // Test login
    console.log('Testing user login...');
    const login = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@inventory.com',
      password: 'admin123'
    });
    console.log('✅ Login successful:', login.data);

    const token = login.data.data.token;

    // Test protected endpoint
    console.log('Testing protected endpoint...');
    const me = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Protected endpoint successful:', me.data);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAPI();
```

Run the test script:
```cmd
npm install axios
node test-api.js
```

## Next Steps

1. **Test all endpoints** using your preferred method
2. **Verify MongoDB Atlas connection** in the Atlas dashboard
3. **Check data creation** in your database
4. **Test error handling** with invalid data
5. **Verify authentication** and authorization

Choose the testing method that works best for your environment and workflow!

