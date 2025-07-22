const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Add to recently viewed
exports.addToRecentlyViewed = async (req, res) => {
    try {
        const { userId, productId } = req.body;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Remove if product already exists in recently viewed
        user.recentlyViewed = user.recentlyViewed.filter(
            item => item.product.toString() !== productId
        );

        // Add to beginning of array
        user.recentlyViewed.unshift({
            product: productId,
            viewedAt: new Date()
        });

        // Keep only last 12 items
        if (user.recentlyViewed.length > 12) {
            user.recentlyViewed = user.recentlyViewed.slice(0, 12);
        }

        await user.save();
        res.status(200).json({ message: 'Added to recently viewed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get recently viewed items
exports.getRecentlyViewed = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .populate('recentlyViewed.product');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user.recentlyViewed);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add to cart
exports.addToCart = async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const existingItem = user.cart.find(
            item => item.product.toString() === productId
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            user.cart.push({ product: productId, quantity });
        }

        await user.save();
        res.status(200).json({ message: 'Added to cart' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get cart
exports.getCart = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .populate('cart.product');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user.cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add to wishlist
exports.addToWishlist = async (req, res) => {
    try {
        const { userId, productId } = req.body;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.wishlist.includes(productId)) {
            user.wishlist.push(productId);
            await user.save();
            res.status(200).json({ message: 'Added to wishlist' });
        } else {
            res.status(400).json({ message: 'Product already in wishlist' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get wishlist
exports.getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .populate('wishlist');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user.wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create order
exports.createOrder = async (req, res) => {
    try {
        const { userId, items, shippingAddress, paymentMethod } = req.body;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Calculate total amount
        const totalAmount = items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);

        // Create order
        const order = new Order({
            user: userId,
            items,
            totalAmount,
            shippingAddress,
            paymentMethod
        });

        await order.save();

        // Add order to user's orders
        user.orders.push(order._id);
        // Clear cart
        user.cart = [];
        await user.save();

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user orders
exports.getOrders = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .populate({
                path: 'orders',
                populate: {
                    path: 'items.product'
                }
            });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user.orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 