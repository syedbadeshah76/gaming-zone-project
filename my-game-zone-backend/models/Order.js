const mongoose = require('mongoose');
const orderItemSchema = new mongoose.Schema({
    productId: {
        type: Number,
        required: true // <--- This is the key!
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    }
});
const orderSchema = new mongoose.Schema({
    deskNumber: {
        type: Number,
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    customerMobile: {
        type: String,
        required: true
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true
    },
    orderTime: {
        type: Date,
        default: Date.now
    },
    checkoutTime: {
        type: Date,
        default: null // Will be updated on checkout
    },
    status: {
        type: String,
        enum: ['active', 'checked_out'], // 'active' for ongoing sessions, 'checked_out' for completed
        default: 'active'
    }
});

module.exports = mongoose.model('Order', orderSchema);