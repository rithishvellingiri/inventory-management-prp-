# MongoDB Atlas Setup Guide

This guide will walk you through setting up MongoDB Atlas for your Inventory Management System backend.

## What is MongoDB Atlas?

MongoDB Atlas is a fully managed cloud database service that provides:
- Automatic backups and recovery
- Built-in security features
- Global clusters
- Real-time performance monitoring
- Automatic scaling

## Step-by-Step Setup

### Step 1: Create MongoDB Atlas Account

1. **Go to MongoDB Atlas**
   - Visit [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Click "Try Free" or "Start Free"

2. **Sign Up**
   - Create an account using your email
   - Verify your email address
   - Complete the registration process

### Step 2: Create a New Cluster

1. **Choose a Plan**
   - Select "M0 Sandbox" (Free tier) for development
   - For production, choose M10 or higher

2. **Configure Cluster**
   - **Cloud Provider**: Choose AWS, Google Cloud, or Azure
   - **Region**: Select the region closest to your users
   - **Cluster Name**: Use "inventory-cluster" or similar

3. **Create Cluster**
   - Click "Create Cluster"
   - Wait for the cluster to be created (2-3 minutes)

### Step 3: Set Up Database Access

1. **Create Database User**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - **Username**: `inventory-admin` (or your preferred username)
   - **Password**: Generate a secure password (save this!)
   - **Database User Privileges**: Select "Atlas admin" for full access
   - Click "Add User"

2. **Save Credentials**
   - Note down your username and password
   - You'll need these for the connection string

### Step 4: Configure Network Access

1. **Add IP Address**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add specific IP addresses
   - Click "Confirm"

### Step 5: Get Connection String

1. **Connect to Cluster**
   - Go to "Clusters" in the left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Select "Node.js" as driver
   - Copy the connection string

2. **Connection String Format**
   ```
   mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 6: Configure Your Application

1. **Update Environment Variables**
   ```bash
   cd backend
   cp env.example .env
   ```

2. **Edit .env file**
   ```env
   # Database - MongoDB Atlas
   MONGODB_URI=mongodb+srv://inventory-admin:your_password@inventory-cluster.xxxxx.mongodb.net/inventory_management?retryWrites=true&w=majority
   MONGODB_TEST_URI=mongodb+srv://inventory-admin:your_password@inventory-cluster.xxxxx.mongodb.net/inventory_management_test?retryWrites=true&w=majority

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

3. **Replace Placeholders**
   - Replace `<username>` with your database username
   - Replace `<password>` with your database password
   - Replace `<cluster-name>` with your actual cluster name
   - Update `JWT_SECRET` with a secure random string

### Step 7: Test Connection

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Test Connection**
   ```bash
   npm run dev
   ```

   You should see:
   ```
   MongoDB Atlas connected: inventory-cluster-shard-00-00.xxxxx.mongodb.net
   Server running on port 3000
   ```

3. **Seed Database (Optional)**
   ```bash
   npm run seed
   ```

### Step 8: Verify Setup

1. **Check Database**
   - Go to "Collections" in MongoDB Atlas
   - You should see your database and collections
   - Verify that data was created (if you ran the seed script)

2. **Test API Endpoints**
   ```bash
   # Health check
   curl http://localhost:3000/api/health

   # Register a user
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "password123",
       "fullName": "Test User"
     }'
   ```

## Security Best Practices

### 1. Database User Security
- Use strong passwords
- Create specific users for different environments
- Use least privilege principle

### 2. Network Security
- **Development**: Allow access from anywhere (0.0.0.0/0)
- **Production**: Whitelist specific IP addresses only
- Use VPC peering for production applications

### 3. Connection String Security
- Never commit connection strings to version control
- Use environment variables
- Rotate passwords regularly

### 4. Application Security
- Use strong JWT secrets
- Enable SSL/TLS in production
- Implement proper error handling

## Environment-Specific Configuration

### Development Environment
```env
MONGODB_URI=mongodb+srv://dev-user:dev-password@dev-cluster.xxxxx.mongodb.net/inventory_management_dev?retryWrites=true&w=majority
NODE_ENV=development
```

### Production Environment
```env
MONGODB_URI=mongodb+srv://prod-user:prod-password@prod-cluster.xxxxx.mongodb.net/inventory_management?retryWrites=true&w=majority
NODE_ENV=production
```

## Troubleshooting

### Common Issues

#### 1. Connection Timeout
```
Error: connect ETIMEDOUT
```
**Solutions:**
- Check your internet connection
- Verify IP whitelist includes your current IP
- Ensure firewall allows MongoDB connections

#### 2. Authentication Failed
```
Error: Authentication failed
```
**Solutions:**
- Verify username and password
- Check database user permissions
- Ensure user has access to the database

#### 3. SSL/TLS Error
```
Error: unable to verify the first certificate
```
**Solutions:**
- Update Node.js to latest version
- Check system certificates
- Use `tls=true` in connection string

#### 4. Cluster Not Found
```
Error: getaddrinfo ENOTFOUND
```
**Solutions:**
- Verify cluster name in connection string
- Check if cluster is running
- Ensure correct region

### Debug Connection

Add this to your server.js for debugging:
```javascript
mongoose.set('debug', true);
```

## Monitoring and Maintenance

### 1. Atlas Monitoring
- Monitor cluster performance in Atlas dashboard
- Set up alerts for high CPU/memory usage
- Monitor connection count

### 2. Backup Strategy
- Atlas provides automatic backups
- Configure backup retention policy
- Test restore procedures

### 3. Scaling
- Monitor database size and performance
- Scale up cluster when needed
- Consider sharding for large datasets

## Cost Optimization

### Free Tier (M0)
- 512 MB storage
- Shared RAM and vCPU
- Good for development and small applications

### Paid Tiers
- M10+: Dedicated resources
- Better performance
- More storage options
- Advanced features

## Next Steps

1. **Set up monitoring** - Configure alerts and monitoring
2. **Implement backups** - Set up backup strategy
3. **Security review** - Audit security settings
4. **Performance tuning** - Optimize queries and indexes
5. **Scaling plan** - Plan for future growth

## Support Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [MongoDB University](https://university.mongodb.com/)
- [Atlas Support](https://support.mongodb.com/)
- [Community Forum](https://community.mongodb.com/)

## Quick Reference

### Connection String Template
```
mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/<database>?retryWrites=true&w=majority
```

### Environment Variables
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
JWT_SECRET=your-secret-key
NODE_ENV=development
PORT=3000
```

### Useful Commands
```bash
# Start development server
npm run dev

# Seed database
npm run seed

# Test connection
curl http://localhost:3000/api/health
```

Your MongoDB Atlas setup is now complete! 🎉

