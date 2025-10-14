const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        trim: true,
        maxlength: [500, 'Message cannot exceed 500 characters']
    },
    type: {
        type: String,
        enum: ['feedback', 'enquiry'],
        default: 'feedback'
    },
    chatbotReply: {
        type: String,
        trim: true,
        maxlength: [500, 'Chatbot reply cannot exceed 500 characters']
    },
    status: {
        type: String,
        enum: ['pending', 'replied', 'resolved'],
        default: 'pending'
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    }
}, {
    timestamps: true
});

// Index for better query performance
feedbackSchema.index({ userId: 1 });
feedbackSchema.index({ productId: 1 });
feedbackSchema.index({ type: 1 });
feedbackSchema.index({ status: 1 });
feedbackSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema);

