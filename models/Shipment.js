const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    trackingNumber: {
        type: String,
        unique: true
    },
    carrier: {
        type: String,
        required: true,
        enum: ['fedex', 'ups', 'usps', 'dhl', 'local']
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'processing', 'shipped', 'in_transit', 'delivered', 'failed'],
        default: 'pending'
    },
    shippingAddress: {
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        zipCode: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        }
    },
    shippingMethod: {
        type: String,
        required: true,
        enum: ['standard', 'express', 'overnight', 'local_pickup']
    },
    shippingCost: {
        type: Number,
        required: true,
        min: 0
    },
    estimatedDelivery: {
        start: Date,
        end: Date
    },
    actualDelivery: Date,
    trackingHistory: [{
        status: String,
        location: String,
        timestamp: {
            type: Date,
            default: Date.now
        },
        description: String
    }],
    notes: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
shipmentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Generate tracking number before saving
shipmentSchema.pre('save', function(next) {
    if (!this.trackingNumber) {
        this.trackingNumber = 'TRK' + Date.now().toString(36).toUpperCase();
    }
    next();
});

module.exports = mongoose.model('Shipment', shipmentSchema); 