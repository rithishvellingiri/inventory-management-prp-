# Backend Setup Guide

This guide will help you set up the Inventory Management System backend API.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **MongoDB Atlas Account** - [Sign up here](https://www.mongodb.com/atlas) (Free tier available)
- **Git** - [Download here](https://git-scm.com/)

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure it:

```bash
cp env.example .env
```

Edit the `.env` file with your MongoDB Atlas settings:

```env
# Database - MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/inventory_management?retryWrites=true&w=majority
MONGODB_TEST_URI=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/inventory_management_test?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRE=7d

# Server
PORT=3000
NODE_ENV=development

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# CORS
FRONTEND_URL=http://localhost:4200
```

**Important**: 
- Replace `<username>`, `<password>`, and `<cluster-name>` with your MongoDB Atlas credentials
- Change the `JWT_SECRET` to a secure random string for production use

### 3. Set Up MongoDB Atlas

**Follow the detailed guide**: [MONGODB_ATLAS_SETUP.md](./MONGODB_ATLAS_SETUP.md)

**Quick Steps:**
1. Create free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster (M0 Sandbox - Free)
3. Create database user with admin privileges
4. Whitelist your IP address (0.0.0.0/0 for development)
5. Get connection string and update `.env` file

### 4. Test Connection

Test if your MongoDB Atlas connection is working:

```bash
npm run dev
```

You should see:
```
MongoDB Atlas connected: your-cluster-name.xxxxx.mongodb.net
Server running on port 3000
```

### 5. Seed the Database (Optional)

Populate the database with sample data:

```bash
npm run seed
```

This will create:
- 2 users (1 admin, 1 regular user)
- 6 categories
- 5 suppliers
- 12 sample products

**Default Login Credentials:**
- Admin: `admin@inventory.com` / `admin123`
- User: `user@inventory.com` / `user123`

### 6. Start the Server

#### Development Mode (with auto-restart)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

The API will be available at `http://localhost:3000`

## API Testing

### Health Check
Test if the server is running:
```bash
curl http://localhost:3000/api/health
```

### User Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'
```

### User Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@inventory.com",
    "password": "admin123"
  }'
```

## Project Structure

```
backend/
├── models/           # MongoDB models
│   ├── User.js
│   ├── Product.js
│   ├── Category.js
│   ├── Supplier.js
│   ├── Order.js
│   ├── Cart.js
│   ├── Feedback.js
│   └── History.js
├── routes/           # API routes
│   ├── auth.js
│   ├── users.js
│   ├── products.js
│   ├── categories.js
│   ├── suppliers.js
│   ├── orders.js
│   ├── cart.js
│   ├── feedback.js
│   └── history.js
├── middleware/       # Custom middleware
│   ├── auth.js
│   ├── validation.js
│   └── errorHandler.js
├── scripts/          # Utility scripts
│   └── seed.js
├── server.js         # Main server file
├── package.json
├── README.md
└── SETUP.md
```

## Configuration Options

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/inventory_management` |
| `JWT_SECRET` | Secret key for JWT tokens | Required |
| `JWT_EXPIRE` | JWT token expiration time | `7d` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:4200` |
| `MAX_FILE_SIZE` | Maximum file upload size | `5242880` (5MB) |
| `UPLOAD_PATH` | File upload directory | `./uploads` |

### CORS Configuration

The API is configured to accept requests from your frontend URL. Update the `FRONTEND_URL` in your `.env` file to match your frontend application URL.

### Rate Limiting

The API includes rate limiting to prevent abuse:
- 100 requests per 15 minutes per IP address
- Applied to all `/api/` routes

## Database Management

### MongoDB Connection

The application uses Mongoose ODM to connect to MongoDB. Connection options:
- Automatic reconnection
- Connection pooling
- Error handling

### Data Models

All models include:
- Timestamps (createdAt, updatedAt)
- Validation
- Indexes for performance
- Virtual fields where appropriate

### Backup and Restore

#### Backup
```bash
mongodump --db inventory_management --out ./backup
```

#### Restore
```bash
mongorestore --db inventory_management ./backup/inventory_management
```

## Security Features

### Authentication
- JWT-based authentication
- Password hashing with bcryptjs
- Token expiration
- Secure token storage

### Authorization
- Role-based access control (admin/user)
- Protected routes
- Resource ownership validation

### Security Headers
- Helmet.js for security headers
- CORS protection
- Rate limiting
- Input validation and sanitization

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Ensure MongoDB is running and accessible on port 27017.

#### 2. JWT Secret Error
```
Error: secretOrPrivateKey must have a value
```
**Solution**: Set a valid `JWT_SECRET` in your `.env` file.

#### 3. Port Already in Use
```
Error: listen EADDRINUSE :::3000
```
**Solution**: Change the `PORT` in your `.env` file or stop the process using port 3000.

#### 4. CORS Error
```
Access to fetch at 'http://localhost:3000/api/auth/login' from origin 'http://localhost:4200' has been blocked by CORS policy
```
**Solution**: Update `FRONTEND_URL` in your `.env` file to match your frontend URL.

### Logs and Debugging

#### Development Logs
The server logs requests in development mode using Morgan middleware.

#### Error Logs
All errors are logged to the console and stored in the history collection.

#### Database Logs
MongoDB connection status and errors are logged to the console.

## Production Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use a secure MongoDB connection string
3. Set a strong `JWT_SECRET`
4. Configure proper CORS origins
5. Set up SSL/TLS certificates

### Performance Optimization
- Enable MongoDB connection pooling
- Use Redis for session storage (optional)
- Implement caching strategies
- Monitor API performance

### Security Checklist
- [ ] Strong JWT secret
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation active
- [ ] Error handling secure
- [ ] Database access secured

## Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the logs for error messages
3. Ensure all prerequisites are installed
4. Verify environment configuration
5. Check MongoDB connection and data

For additional help, refer to the main README.md file or create an issue in the repository.
