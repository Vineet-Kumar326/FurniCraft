const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Shipment = require('../models/Shipment');
const Order = require('../models/Order');

// Create shipment for an order
router.post('/:orderId', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if shipment already exists
        const existingShipment = await Shipment.findOne({ order: order._id });
        if (existingShipment) {
            return res.status(400).json({ message: 'Shipment already exists for this order' });
        }

        const shipment = new Shipment({
            order: order._id,
            user: req.user.id,
            carrier: req.body.carrier,
            shippingAddress: order.shippingAddress,
            shippingMethod: req.body.shippingMethod,
            shippingCost: req.body.shippingCost,
            estimatedDelivery: {
                start: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
                end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)   // 7 days from now
            }
        });

        await shipment.save();

        // Update order with shipment reference
        order.shipment = shipment._id;
        await order.save();

        res.status(201).json(shipment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get shipment details
router.get('/:shipmentId', auth, async (req, res) => {
    try {
        const shipment = await Shipment.findById(req.params.shipmentId)
            .populate('order')
            .populate('user', '-password');
        
        if (!shipment) {
            return res.status(404).json({ message: 'Shipment not found' });
        }

        // Check if user is authorized to view this shipment
        if (shipment.user._id.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(shipment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update shipment status
router.patch('/:shipmentId/status', auth, async (req, res) => {
    try {
        const shipment = await Shipment.findById(req.params.shipmentId);
        if (!shipment) {
            return res.status(404).json({ message: 'Shipment not found' });
        }

        // Only admin can update shipment status
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        shipment.status = req.body.status;
        
        // Add to tracking history
        shipment.trackingHistory.push({
            status: req.body.status,
            location: req.body.location,
            description: req.body.description
        });

        // Update order status if shipment is delivered
        if (req.body.status === 'delivered') {
            const order = await Order.findById(shipment.order);
            if (order) {
                order.status = 'delivered';
                await order.save();
            }
            shipment.actualDelivery = new Date();
        }

        await shipment.save();

        res.json(shipment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get shipment by tracking number
router.get('/track/:trackingNumber', async (req, res) => {
    try {
        const shipment = await Shipment.findOne({ trackingNumber: req.params.trackingNumber })
            .populate('order', 'items totalAmount')
            .populate('user', 'name email');
        
        if (!shipment) {
            return res.status(404).json({ message: 'Shipment not found' });
        }

        res.json(shipment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 