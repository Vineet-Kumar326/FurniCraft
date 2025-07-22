const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const Shipment = require('../models/Shipment');

// Create a new order
router.post('/', auth, async (req, res) => {
    try {
        const { items, shippingAddress, paymentMethod, notes } = req.body;

        // Calculate total amount and validate products
        let totalAmount = 0;
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ message: `Product ${item.product} not found` });
            }
            if (!product.isActive) {
                return res.status(400).json({ message: `Product ${product.name} is not available` });
            }
            totalAmount += product.price * item.quantity;
        }

        const order = new Order({
            user: req.user.id,
            items,
            totalAmount,
            shippingAddress,
            paymentMethod,
            notes,
            status: 'pending'
        });

        await order.save();

        // Create payment record
        const payment = new Payment({
            order: order._id,
            user: req.user.id,
            amount: totalAmount,
            paymentMethod,
            status: 'pending'
        });

        await payment.save();

        // Update order with payment reference
        order.payment = payment._id;
        await order.save();

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all orders for a user
router.get('/my-orders', auth, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .populate('items.product')
            .populate('payment')
            .populate('shipment')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get order details
router.get('/:orderId', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId)
            .populate('items.product')
            .populate('payment')
            .populate('shipment')
            .populate('user', '-password');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user is authorized to view this order
        if (order.user._id.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update order status (admin only)
router.patch('/:orderId/status', auth, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const order = await Order.findById(req.params.orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.status = req.body.status;
        await order.save();

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Cancel order
router.post('/:orderId/cancel', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user is authorized to cancel this order
        if (order.user.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Check if order can be cancelled
        if (!['pending', 'processing'].includes(order.status)) {
            return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
        }

        order.status = 'cancelled';
        await order.save();

        // Update payment status if exists
        if (order.payment) {
            const payment = await Payment.findById(order.payment);
            if (payment) {
                payment.status = 'refunded';
                await payment.save();
            }
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all orders (admin only)
router.get('/', auth, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const orders = await Order.find()
            .populate('items.product')
            .populate('payment')
            .populate('shipment')
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 