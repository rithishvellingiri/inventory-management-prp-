# Debug Registration Issue

## Quick Debugging Steps

### 1. Check Browser Console
1. Open your Angular app in browser
2. Press F12 to open Developer Tools
3. Go to **Console** tab
4. Try to register a new account
5. Look for any error messages

### 2. Check Network Tab
1. In Developer Tools, go to **Network** tab
2. Try to register a new account
3. Look for the registration request
4. Check if it shows:
   - ✅ **200** - Success
   - ❌ **400** - Validation error
   - ❌ **500** - Server error
   - ❌ **CORS error** - Cross-origin issue

### 3. Test Backend Directly

#### Test with curl (Windows PowerShell):
```powershell
$body = @{
    email = "testuser@example.com"
    password = "password123"
    fullName = "Test User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

#### Test with Postman:
1. Create new POST request
2. URL: `http://localhost:3000/api/auth/register`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "email": "testuser@example.com",
  "password": "password123",
  "fullName": "Test User"
}
```

### 4. Common Issues and Solutions

#### Issue 1: CORS Error
**Error**: `Access to fetch at 'http://localhost:3000/api/auth/register' from origin 'http://localhost:4200' has been blocked by CORS policy`

**Solution**: Check your `.env` file:
```env
FRONTEND_URL=http://localhost:4200
```

#### Issue 2: Validation Error
**Error**: `Validation failed`

**Check**:
- Email format: `user@example.com`
- Password length: at least 6 characters
- Full name: at least 2 characters

#### Issue 3: Server Not Running
**Error**: `Failed to fetch` or `Connection refused`

**Solution**: Make sure backend is running:
```cmd
cd backend
npm run dev
```

#### Issue 4: MongoDB Connection
**Error**: `MongoDB connection error`

**Solution**: Check your MongoDB Atlas connection string in `.env`

### 5. Debug Frontend Code

Add console logs to your register component:

```typescript
onSubmit(): void {
  console.log('Registration data:', {
    email: this.email,
    password: this.password,
    fullName: this.fullName
  });
  
  this.authService.register(this.email, this.password, this.fullName).subscribe({
    next: (result) => {
      console.log('Registration result:', result);
      // ... rest of your code
    },
    error: (error) => {
      console.error('Registration error:', error);
      // ... rest of your code
    }
  });
}
```

### 6. Test with Sample Data

Try registering with this exact data:
- **Email**: `testuser@example.com`
- **Password**: `password123`
- **Full Name**: `Test User`

### 7. Check Server Logs

Look at your backend terminal for any error messages when you try to register.

## What to Report

When asking for help, please provide:

1. **Exact error message** you see
2. **Where** you see it (browser console, UI, etc.)
3. **Browser console logs** (if any)
4. **Network tab** request/response (if any)
5. **Backend terminal logs** (if any)

## Quick Test Commands

```cmd
# Test backend health
curl http://localhost:3000/api/health

# Test registration endpoint
curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"password123\",\"fullName\":\"Test User\"}"
```

