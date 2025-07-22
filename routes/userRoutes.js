const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Recently viewed routes
router.post('/recently-viewed', userController.addToRecentlyViewed);
router.get('/recently-viewed/:userId', userController.getRecentlyViewed);

// Cart routes
router.post('/cart', userController.addToCart);
router.get('/cart/:userId', userController.getCart);

// Wishlist routes
router.post('/wishlist', userController.addToWishlist);
router.get('/wishlist/:userId', userController.getWishlist);

// Order routes
router.post('/orders', userController.createOrder);
router.get('/orders/:userId', userController.getOrders);

module.exports = router; 