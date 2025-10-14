const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const History = require('../models/History');
const { authenticate } = require('../middleware/auth');
const { validateCartItem, validateObjectId } = require('../middleware/validation');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', authenticate, async (req, res, next) => {
    try {
        let cart = await Cart.findOne({ userId: req.user._id }).populate({
            path: 'items.productId',
            select: 'name price stock image isActive',
            populate: [
                { path: 'categoryId', select: 'name' },
                { path: 'supplierId', select: 'name' }
            ]
        });

        if (!cart) {
            cart = new Cart({ userId: req.user._id, items: [] });
            await cart.save();
        }

        // Filter out inactive products and update cart
        const activeItems = cart.items.filter(item =>
            item.productId && item.productId.isActive
        );

        if (activeItems.length !== cart.items.length) {
            cart.items = activeItems;
            await cart.save();
        }

        // Calculate totals
        const itemsWithTotals = cart.items.map(item => ({
            productId: item.productId._id,
            productName: item.productId.name,
            price: item.productId.price,
            quantity: item.quantity,
            stock: item.productId.stock,
            image: item.productId.image,
            categoryName: item.productId.categoryId?.name,
            supplierName: item.productId.supplierId?.name,
            total: item.productId.price * item.quantity
        }));

        const totalAmount = itemsWithTotals.reduce((sum, item) => sum + item.total, 0);

        res.json({
            success: true,
            data: {
                items: itemsWithTotals,
                totalItems: cart.totalItems,
                totalAmount
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/cart/add
// @desc    Add item to cart
// @access  Private
router.post('/add', authenticate, validateCartItem, async (req, res, next) => {
    try {
        const { productId, quantity } = req.body;

        // Check if product exists and is active
        const product = await Product.findById(productId);
        if (!product || !product.isActive) {
            return next(new AppError('Product not found or inactive', 404));
        }

        // Check stock availability
        if (product.stock < quantity) {
            return next(new AppError(`Only ${product.stock} items available in stock`, 400));
        }

        // Find or create cart
        let cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) {
            cart = new Cart({ userId: req.user._id, items: [] });
        }

        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex(
            item => item.productId.toString() === productId
        );

        if (existingItemIndex > -1) {
            // Update quantity
            const newQuantity = cart.items[existingItemIndex].quantity + quantity;

            if (newQuantity > product.stock) {
                return next(new AppError(`Only ${product.stock} items available in stock`, 400));
            }

            cart.items[existingItemIndex].quantity = newQuantity;
        } else {
            // Add new item
            cart.items.push({ productId, quantity });
        }

        await cart.save();

        // Log cart update to history
        await History.create({
            userId: req.user._id,
            actionType: 'cart_add',
            description: `${req.user.fullName} added ${quantity} ${product.name} to cart`,
            metadata: { productId, quantity },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: 'Item added to cart successfully',
            data: {
                cart: cart.toJSON()
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/cart/update/:productId
// @desc    Update item quantity in cart
// @access  Private
router.put('/update/:productId', authenticate, validateObjectId('productId'), async (req, res, next) => {
    try {
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return next(new AppError('Quantity must be at least 1', 400));
        }

        // Check if product exists and is active
        const product = await Product.findById(req.params.productId);
        if (!product || !product.isActive) {
            return next(new AppError('Product not found or inactive', 404));
        }

        // Check stock availability
        if (product.stock < quantity) {
            return next(new AppError(`Only ${product.stock} items available in stock`, 400));
        }

        const cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) {
            return next(new AppError('Cart not found', 404));
        }

        const itemIndex = cart.items.findIndex(
            item => item.productId.toString() === req.params.productId
        );

        if (itemIndex === -1) {
            return next(new AppError('Item not found in cart', 404));
        }

        const oldQuantity = cart.items[itemIndex].quantity;
        cart.items[itemIndex].quantity = quantity;
        await cart.save();

        // Log cart update to history
        await History.create({
            userId: req.user._id,
            actionType: 'cart_update',
            description: `${req.user.fullName} updated ${product.name} quantity from ${oldQuantity} to ${quantity}`,
            metadata: { productId: req.params.productId, oldQuantity, newQuantity: quantity },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: 'Cart updated successfully',
            data: {
                cart: cart.toJSON()
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/cart/remove/:productId
// @desc    Remove item from cart
// @access  Private
router.delete('/remove/:productId', authenticate, validateObjectId('productId'), async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) {
            return next(new AppError('Cart not found', 404));
        }

        const itemIndex = cart.items.findIndex(
            item => item.productId.toString() === req.params.productId
        );

        if (itemIndex === -1) {
            return next(new AppError('Item not found in cart', 404));
        }

        const removedItem = cart.items[itemIndex];
        cart.items.splice(itemIndex, 1);
        await cart.save();

        // Get product name for logging
        const product = await Product.findById(req.params.productId);

        // Log cart update to history
        await History.create({
            userId: req.user._id,
            actionType: 'cart_remove',
            description: `${req.user.fullName} removed ${product?.name || 'product'} from cart`,
            metadata: { productId: req.params.productId, quantity: removedItem.quantity },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: 'Item removed from cart successfully',
            data: {
                cart: cart.toJSON()
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/cart/clear
// @desc    Clear entire cart
// @access  Private
router.delete('/clear', authenticate, async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) {
            return next(new AppError('Cart not found', 404));
        }

        const itemCount = cart.items.length;
        cart.items = [];
        await cart.save();

        // Log cart clear to history
        await History.create({
            userId: req.user._id,
            actionType: 'cart_clear',
            description: `${req.user.fullName} cleared cart (${itemCount} items)`,
            metadata: { itemCount },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: 'Cart cleared successfully',
            data: {
                cart: cart.toJSON()
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/cart/count
// @desc    Get cart item count
// @access  Private
router.get('/count', authenticate, async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id });
        const count = cart ? cart.totalItems : 0;

        res.json({
            success: true,
            data: {
                count
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

