# Database Connections Guide

This guide provides all the proper database connections and table structures for your Inventory Management System.

## MongoDB Atlas Connection

### Connection String Format
```
mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/<database>?retryWrites=true&w=majority
```

### Environment Variables
```env
# Database - MongoDB Atlas
MONGODB_URI=mongodb+srv://inventory-admin:your_password@inventory-cluster.xxxxx.mongodb.net/inventory_management?retryWrites=true&w=majority
MONGODB_TEST_URI=mongodb+srv://inventory-admin:your_password@inventory-cluster.xxxxx.mongodb.net/inventory_management_test?retryWrites=true&w=majority
```

## Database Collections (Tables)

### 1. Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  fullName: String (required),
  phone: String (optional),
  role: String (enum: ['admin', 'user'], default: 'user'),
  isActive: Boolean (default: true),
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ email: 1 }` - Unique index
- `{ role: 1 }` - For role-based queries

### 2. Categories Collection
```javascript
{
  _id: ObjectId,
  name: String (unique, required),
  description: String (required),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ name: 1 }` - Unique index
- `{ isActive: 1 }` - For filtering active categories

### 3. Suppliers Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  contact: String (required),
  email: String (unique, required),
  address: String (required),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ name: 1 }` - For name searches
- `{ email: 1 }` - Unique index
- `{ isActive: 1 }` - For filtering active suppliers

### 4. Products Collection
```javascript
{
  _id: ObjectId,
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

**Indexes:**
- `{ name: 1 }` - For name searches
- `{ categoryId: 1 }` - For category filtering
- `{ supplierId: 1 }` - For supplier filtering
- `{ price: 1 }` - For price sorting
- `{ stock: 1 }` - For stock queries
- `{ isActive: 1 }` - For filtering active products

### 5. Orders Collection
```javascript
{
  _id: ObjectId,
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

**Indexes:**
- `{ userId: 1 }` - For user's orders
- `{ paymentStatus: 1 }` - For payment filtering
- `{ status: 1 }` - For status filtering
- `{ createdAt: -1 }` - For recent orders

### 6. Cart Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', required, unique),
  items: [{
    productId: ObjectId (ref: 'Product', required),
    quantity: Number (required, min: 1)
  }],
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ userId: 1 }` - Unique index for user's cart

### 7. Feedback Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', required),
  productId: ObjectId (ref: 'Product', optional),
  message: String (required),
  type: String (enum: ['feedback', 'enquiry'], default: 'feedback'),
  chatbotReply: String (optional),
  status: String (enum: ['pending', 'replied', 'resolved'], default: 'pending'),
  rating: Number (min: 1, max: 5, optional),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ userId: 1 }` - For user's feedback
- `{ productId: 1 }` - For product feedback
- `{ type: 1 }` - For feedback type filtering
- `{ status: 1 }` - For status filtering
- `{ createdAt: -1 }` - For recent feedback

### 8. History Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', optional),
  actionType: String (required),
  description: String (required),
  metadata: Object (optional),
  ipAddress: String (optional),
  userAgent: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ userId: 1 }` - For user's history
- `{ actionType: 1 }` - For action type filtering
- `{ createdAt: -1 }` - For recent activities

## API Endpoints for Database Operations

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `PUT /api/products/:id/stock` - Update stock (Admin)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create new category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Suppliers
- `GET /api/suppliers` - Get all suppliers
- `GET /api/suppliers/:id` - Get supplier by ID
- `POST /api/suppliers` - Create new supplier (Admin)
- `PUT /api/suppliers/:id` - Update supplier (Admin)
- `DELETE /api/suppliers/:id` - Delete supplier (Admin)

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get user by ID (Admin)
- `PUT /api/users/:id` - Update user (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)

### Orders
- `GET /api/orders` - Get orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status (Admin)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update/:productId` - Update item quantity
- `DELETE /api/cart/remove/:productId` - Remove item from cart
- `DELETE /api/cart/clear` - Clear cart

### Feedback
- `GET /api/feedback` - Get feedback
- `POST /api/feedback` - Create feedback
- `PUT /api/feedback/:id/reply` - Reply to feedback (Admin)

### History
- `GET /api/history` - Get history logs
- `GET /api/history/stats/overview` - Get statistics (Admin)

## Testing Database Connections

### 1. Test MongoDB Atlas Connection
```bash
cd backend
node -e "
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Atlas connected successfully'))
  .catch(err => console.error('❌ Connection failed:', err));
"
```

### 2. Test All Collections
```bash
node test-database-connections.js
```

### 3. Verify Data in Atlas Dashboard
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Click on your cluster
3. Click "Browse Collections"
4. Verify all collections exist with data

## Common Issues and Solutions

### Issue 1: Connection Timeout
**Error**: `MongoServerError: connection timed out`

**Solutions**:
- Check internet connection
- Verify IP whitelist in Atlas
- Check firewall settings

### Issue 2: Authentication Failed
**Error**: `MongoServerError: Authentication failed`

**Solutions**:
- Verify username and password
- Check database user permissions
- Ensure user has access to database

### Issue 3: Collection Not Found
**Error**: `MongoServerError: collection does not exist`

**Solutions**:
- Run seed script: `npm run seed`
- Check if data was created
- Verify collection names

### Issue 4: Index Errors
**Error**: `MongoServerError: index already exists`

**Solutions**:
- This is normal, indexes are created automatically
- Can be ignored in development

## Performance Optimization

### 1. Indexes
All collections have proper indexes for:
- Primary queries
- Filtering
- Sorting
- Relationships

### 2. Connection Pooling
Mongoose automatically handles connection pooling:
- Default: 5 connections
- Max: 10 connections
- Min: 0 connections

### 3. Query Optimization
- Use `select()` to limit fields
- Use `populate()` for relationships
- Use `lean()` for read-only queries

## Backup and Recovery

### 1. Atlas Automatic Backups
- Enabled by default
- 7-day retention (free tier)
- Point-in-time recovery

### 2. Manual Backup
```bash
mongodump --uri="your-connection-string" --out=./backup
```

### 3. Restore
```bash
mongorestore --uri="your-connection-string" ./backup/inventory_management
```

## Security Best Practices

### 1. Database Access
- Use least privilege principle
- Create specific users for different environments
- Rotate passwords regularly

### 2. Network Security
- Whitelist specific IP addresses
- Use VPC peering for production
- Enable SSL/TLS

### 3. Application Security
- Use environment variables for connection strings
- Implement proper error handling
- Validate all inputs

## Monitoring and Alerts

### 1. Atlas Monitoring
- Monitor cluster performance
- Set up alerts for high CPU/memory
- Track connection count

### 2. Application Monitoring
- Log database operations
- Monitor query performance
- Track error rates

Your database is now properly configured with MongoDB Atlas! 🎉

