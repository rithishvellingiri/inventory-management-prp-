const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category is required']
    },
    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: [true, 'Supplier is required']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    stock: {
        type: Number,
        required: [true, 'Stock is required'],
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    image: {
        type: String,
        trim: true,
        default: '' // Default empty string if no image is provided
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lowStockThreshold: {
        type: Number,
        default: 10,
        min: [0, 'Low stock threshold cannot be negative']
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true }, // Ensure virtual fields are included in JSON
    toObject: { virtuals: true } // Include virtuals when converting to objects
});

// Indexes for faster queries
productSchema.index({ name: 1 });
productSchema.index({ categoryId: 1 });
productSchema.index({ supplierId: 1 });
productSchema.index({ price: 1 });
productSchema.index({ stock: 1 });
productSchema.index({ isActive: 1 });

// Virtual field: check if product is low on stock
productSchema.virtual('isLowStock').get(function () {
    return this.stock <= this.lowStockThreshold;
});

module.exports = mongoose.model('Product', productSchema);
