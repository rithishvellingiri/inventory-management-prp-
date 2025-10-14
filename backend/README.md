# Inventory Management System - Backend API

A comprehensive REST API for an inventory management system built with Node.js, Express, and MongoDB.

## Features

- **User Management**: Registration, authentication, profile management
- **Product Management**: CRUD operations, stock management, low stock alerts
- **Category Management**: Product categorization and organization
- **Supplier Management**: Supplier information and product relationships
- **Order Management**: Order processing, status tracking, payment integration
- **Cart Management**: Shopping cart functionality
- **Feedback System**: Customer feedback and enquiry management
- **Activity History**: Comprehensive audit trail
- **Admin Dashboard**: Administrative controls and analytics

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs, helmet, CORS, rate limiting
- **Validation**: express-validator
- **File Upload**: multer

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas Account ([Sign up here](https://www.mongodb.com/atlas) - Free tier available)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd inventory-management-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your MongoDB Atlas configuration:
   ```env
   # Database - MongoDB Atlas
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/inventory_management?retryWrites=true&w=majority
   MONGODB_TEST_URI=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/inventory_management_test?retryWrites=true&w=majority

   # JWT
   JWT_SECRET=your_super_secret_jwt_key_here
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

4. **Set up MongoDB Atlas**
   - Follow the detailed guide in [MONGODB_ATLAS_SETUP.md](./MONGODB_ATLAS_SETUP.md)
   - Create a free MongoDB Atlas account
   - Create a cluster and get your connection string
   - Update the `.env` file with your Atlas connection string

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

The API will be available at `http://localhost:3000`

## MongoDB Atlas Setup

For detailed MongoDB Atlas setup instructions, see [MONGODB_ATLAS_SETUP.md](./MONGODB_ATLAS_SETUP.md)

**Quick Atlas Setup:**
1. Create free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster (M0 Sandbox - Free)
3. Create database user
4. Whitelist your IP address
5. Get connection string and update `.env` file

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Endpoints Overview

#### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /me` - Get current user
- `PUT /profile` - Update user profile
- `PUT /change-password` - Change password

#### Users (`/api/users`) - Admin Only
- `GET /` - Get all users
- `GET /:id` - Get user by ID
- `PUT /:id` - Update user
- `DELETE /:id` - Delete user
- `PUT /:id/toggle-status` - Toggle user status
- `GET /stats/overview` - Get user statistics

#### Categories (`/api/categories`)
- `GET /` - Get all categories
- `GET /:id` - Get category by ID
- `POST /` - Create category (Admin)
- `PUT /:id` - Update category (Admin)
- `DELETE /:id` - Delete category (Admin)
- `PUT /:id/toggle-status` - Toggle category status (Admin)
- `GET /:id/products` - Get products by category

#### Suppliers (`/api/suppliers`)
- `GET /` - Get all suppliers
- `GET /:id` - Get supplier by ID
- `POST /` - Create supplier (Admin)
- `PUT /:id` - Update supplier (Admin)
- `DELETE /:id` - Delete supplier (Admin)
- `PUT /:id/toggle-status` - Toggle supplier status (Admin)
- `GET /:id/products` - Get products by supplier

#### Products (`/api/products`)
- `GET /` - Get all products
- `GET /:id` - Get product by ID
- `POST /` - Create product (Admin)
- `PUT /:id` - Update product (Admin)
- `DELETE /:id` - Delete product (Admin)
- `PUT /:id/toggle-status` - Toggle product status (Admin)
- `PUT /:id/stock` - Update product stock (Admin)
- `GET /stats/overview` - Get product statistics (Admin)

#### Cart (`/api/cart`)
- `GET /` - Get user's cart
- `POST /add` - Add item to cart
- `PUT /update/:productId` - Update item quantity
- `DELETE /remove/:productId` - Remove item from cart
- `DELETE /clear` - Clear entire cart
- `GET /count` - Get cart item count

#### Orders (`/api/orders`)
- `GET /` - Get orders (user's own or all for admin)
- `GET /:id` - Get order by ID
- `POST /` - Create new order
- `PUT /:id/status` - Update order status (Admin)
- `PUT /:id/payment-status` - Update payment status (Admin)
- `GET /stats/overview` - Get order statistics (Admin)

#### Feedback (`/api/feedback`)
- `GET /` - Get feedback
- `GET /:id` - Get feedback by ID
- `POST /` - Create feedback
- `PUT /:id/reply` - Reply to feedback (Admin)
- `PUT /:id/status` - Update feedback status (Admin)
- `DELETE /:id` - Delete feedback (Admin)
- `GET /stats/overview` - Get feedback statistics (Admin)

#### History (`/api/history`)
- `GET /` - Get history logs
- `GET /:id` - Get history entry by ID
- `GET /stats/overview` - Get history statistics (Admin)
- `DELETE /cleanup` - Clean up old entries (Admin)
- `GET /export` - Export history data (Admin)

### Request/Response Examples

#### User Registration
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "phone": "+1234567890"
}
```

#### Product Creation
```bash
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Laptop",
  "categoryId": "64a1b2c3d4e5f6789012345",
  "supplierId": "64a1b2c3d4e5f6789012346",
  "price": 999.99,
  "stock": 50,
  "description": "High-performance laptop",
  "lowStockThreshold": 10
}
```

#### Add to Cart
```bash
POST /api/cart/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "64a1b2c3d4e5f6789012347",
  "quantity": 2
}
```

## Database Schema

### User
```javascript
{
  email: String (unique, required),
  password: String (required, hashed),
  fullName: String (required),
  phone: String (optional),
  role: String (enum: ['admin', 'user'], default: 'user'),
  isActive: Boolean (default: true),
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Product
```javascript
{
  name: String (required),
  categoryId: ObjectId (ref: 'Category', required),
  supplierId: ObjectId (ref: 'Supplier', required),
  price: Number (required, min: 0),
  stock: Number (required, min: 0),
  description: String (required),
  image: String (optional),
  lowStockThreshold: Number (default: 10),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Order
```javascript
{
  userId: ObjectId (ref: 'User', required),
  items: [{
    productId: ObjectId (ref: 'Product', required),
    quantity: Number (required, min: 1),
    price: Number (required, min: 0)
  }],
  totalAmount: Number (required, min: 0),
  paymentStatus: String (enum: ['pending', 'success', 'failed']),
  paymentId: String (required),
  status: String (enum: ['processing', 'completed', 'cancelled']),
  shippingAddress: String (optional),
  notes: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

## Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevents abuse and DDoS attacks
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Secure error responses

## Error Handling

The API uses consistent error response format:

```javascript
{
  "success": false,
  "message": "Error description",
  "errors": [ // Only in validation errors
    {
      "field": "fieldName",
      "message": "Validation message"
    }
  ]
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Deployment

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=mongodb://your-production-db
JWT_SECRET=your-super-secure-secret
PORT=3000
FRONTEND_URL=https://your-frontend-domain.com
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please contact the development team or create an issue in the repository.
