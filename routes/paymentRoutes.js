const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Payment = require('../models/Payment');
const Order = require('../models/Order');

// Create payment for an order
router.post('/:orderId', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if payment already exists
        const existingPayment = await Payment.findOne({ order: order._id });
        if (existingPayment) {
            return res.status(400).json({ message: 'Payment already exists for this order' });
        }

        const payment = new Payment({
            order: order._id,
            user: req.user.id,
            amount: order.totalAmount,
            paymentMethod: req.body.paymentMethod,
            paymentDetails: req.body.paymentDetails,
            billingAddress: req.body.billingAddress
        });

        await payment.save();

        // Update order with payment reference
        order.payment = payment._id;
        await order.save();

        res.status(201).json(payment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get payment details
router.get('/:paymentId', auth, async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.paymentId)
            .populate('order')
            .populate('user', '-password');
        
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        // Check if user is authorized to view this payment
        if (payment.user._id.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(payment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update payment status
router.patch('/:paymentId/status', auth, async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.paymentId);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        // Only admin can update payment status
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        payment.status = req.body.status;
        await payment.save();

        res.json(payment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Process refund
router.post('/:paymentId/refund', auth, async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.paymentId);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        // Only admin can process refunds
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        payment.status = 'refunded';
        payment.refundDetails = {
            amount: req.body.amount || payment.amount,
            reason: req.body.reason,
            processedAt: new Date()
        };

        await payment.save();

        res.json(payment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 