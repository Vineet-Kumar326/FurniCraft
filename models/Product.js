const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    images: [{
        type: String,
        required: true
    }],
    category: {
        type: String,
        required: true,
        enum: ['living-room', 'bedroom', 'dining-room', 'office', 'outdoor', 'kids-room']
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    dimensions: {
        width: Number,
        height: Number,
        depth: Number,
        unit: {
            type: String,
            default: 'cm'
        }
    },
    material: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    weight: {
        value: Number,
        unit: {
            type: String,
            default: 'kg'
        }
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    },
    reviews: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    specifications: {
        type: Map,
        of: String
    },
    warranty: {
        duration: Number,
        unit: {
            type: String,
            enum: ['days', 'months', 'years'],
            default: 'years'
        },
        description: String
    },
    shipping: {
        weight: Number,
        dimensions: {
            length: Number,
            width: Number,
            height: Number
        },
        freeShipping: {
            type: Boolean,
            default: false
        },
        estimatedDelivery: {
            min: Number,
            max: Number,
            unit: {
                type: String,
                enum: ['days', 'weeks'],
                default: 'days'
            }
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
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
productSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Product', productSchema); 