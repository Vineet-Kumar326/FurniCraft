const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Shipment = require('../models/Shipment');
require('dotenv').config();

const sampleProducts = [
    {
        name: "Modern Sofa",
        description: "Elegant and comfortable modern sofa with premium fabric upholstery",
        price: 899.99,
        images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3"],
        category: "living-room",
        stock: 10,
        dimensions: {
            width: 220,
            height: 85,
            depth: 95,
            unit: "cm"
        },
        material: "Premium Fabric",
        color: "Gray",
        weight: {
            value: 85,
            unit: "kg"
        },
        specifications: {
            "Frame Material": "Hardwood",
            "Cushion Type": "High-density foam",
            "Assembly Required": "No"
        },
        warranty: {
            duration: 2,
            unit: "years",
            description: "Manufacturer warranty covering structural defects"
        },
        shipping: {
            weight: 85,
            dimensions: {
                length: 220,
                width: 85,
                height: 95
            },
            freeShipping: true,
            estimatedDelivery: {
                min: 3,
                max: 7,
                unit: "days"
            }
        }
    },
    {
        name: "Wooden Dining Table",
        description: "Solid wood dining table with modern design",
        price: 599.99,
        images: ["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3"],
        category: "dining-room",
        stock: 15,
        dimensions: {
            width: 180,
            height: 75,
            depth: 90,
            unit: "cm"
        },
        material: "Solid Oak",
        color: "Natural Wood",
        weight: {
            value: 65,
            unit: "kg"
        },
        specifications: {
            "Table Top": "Solid oak",
            "Legs": "Solid oak",
            "Assembly Required": "Yes"
        },
        warranty: {
            duration: 1,
            unit: "years",
            description: "Warranty against manufacturing defects"
        },
        shipping: {
            weight: 65,
            dimensions: {
                length: 180,
                width: 75,
                height: 90
            },
            freeShipping: false,
            estimatedDelivery: {
                min: 5,
                max: 10,
                unit: "days"
            }
        }
    },
    {
        name: "Office Desk",
        description: "Ergonomic office desk with cable management",
        price: 449.99,
        images: ["https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?ixlib=rb-4.0.3"],
        category: "office",
        stock: 20,
        dimensions: {
            width: 140,
            height: 75,
            depth: 70,
            unit: "cm"
        },
        material: "Engineered Wood",
        color: "White",
        weight: {
            value: 45,
            unit: "kg"
        },
        specifications: {
            "Surface": "Melamine",
            "Frame": "Steel",
            "Assembly Required": "Yes"
        },
        warranty: {
            duration: 1,
            unit: "years",
            description: "Warranty against manufacturing defects"
        },
        shipping: {
            weight: 45,
            dimensions: {
                length: 140,
                width: 75,
                height: 70
            },
            freeShipping: true,
            estimatedDelivery: {
                min: 3,
                max: 7,
                unit: "days"
            }
        }
    }
];

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/furnicraft', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Product.deleteMany({});
        await Order.deleteMany({});
        await Payment.deleteMany({});
        await Shipment.deleteMany({});
        console.log('Cleared existing data');

        // Create admin user
        const adminPassword = await bcrypt.hash('admin123', 10);
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@furnicraft.com',
            password: adminPassword,
            isAdmin: true
        });
        console.log('Created admin user');

        // Create regular user
        const userPassword = await bcrypt.hash('user123', 10);
        const user = await User.create({
            name: 'Regular User',
            email: 'user@furnicraft.com',
            password: userPassword
        });
        console.log('Created regular user');

        // Create products
        const products = await Product.create(sampleProducts);
        console.log('Created sample products');

        // Create sample order
        const order = await Order.create({
            user: user._id,
            items: [
                {
                    product: products[0]._id,
                    quantity: 1,
                    price: products[0].price
                },
                {
                    product: products[1]._id,
                    quantity: 2,
                    price: products[1].price
                }
            ],
            totalAmount: products[0].price + (products[1].price * 2),
            shippingAddress: {
                street: "123 Main St",
                city: "New York",
                state: "NY",
                zipCode: "10001",
                country: "USA"
            },
            status: "delivered"
        });

        // Create payment for the order
        const payment = await Payment.create({
            order: order._id,
            user: user._id,
            amount: order.totalAmount,
            paymentMethod: "credit_card",
            status: "completed",
            paymentDetails: {
                transactionId: "TRX123456",
                last4: "4242",
                brand: "Visa"
            }
        });

        // Create shipment for the order
        const shipment = await Shipment.create({
            order: order._id,
            user: user._id,
            carrier: "fedex",
            status: "delivered",
            shippingAddress: order.shippingAddress,
            shippingMethod: "standard",
            shippingCost: 0,
            estimatedDelivery: {
                start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                end: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
            },
            actualDelivery: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            trackingHistory: [
                {
                    status: "processing",
                    location: "Warehouse",
                    description: "Order received and processing"
                },
                {
                    status: "shipped",
                    location: "Distribution Center",
                    description: "Package picked up by carrier"
                },
                {
                    status: "in_transit",
                    location: "In Transit",
                    description: "Package in transit"
                },
                {
                    status: "delivered",
                    location: "New York",
                    description: "Package delivered"
                }
            ]
        });

        // Update order with payment and shipment references
        order.payment = payment._id;
        order.shipment = shipment._id;
        await order.save();

        console.log('Created sample order with payment and shipment');
        console.log('Database seeded successfully');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase(); 