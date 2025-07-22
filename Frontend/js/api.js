// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// API Functions
const api = {
    // Authentication
    async register(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });
            return await response.json();
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },

    async login(credentials) {
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials)
            });
            return await response.json();
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    // Products
    async getProducts() {
        try {
            const response = await fetch(`${API_BASE_URL}/allproducts`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    },

    // Cart Operations
    async addToCart(cartItem) {
        try {
            const response = await fetch(`${API_BASE_URL}/cart/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(cartItem)
            });
            return await response.json();
        } catch (error) {
            console.error('Error adding to cart:', error);
            throw error;
        }
    },

    async updateCartItem(itemId, quantity) {
        try {
            const response = await fetch(`${API_BASE_URL}/cart/update/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ quantity })
            });
            return await response.json();
        } catch (error) {
            console.error('Error updating cart:', error);
            throw error;
        }
    },

    async removeFromCart(itemId) {
        try {
            const response = await fetch(`${API_BASE_URL}/cart/remove/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error removing from cart:', error);
            throw error;
        }
    },

    async getCart() {
        try {
            const response = await fetch(`${API_BASE_URL}/cart`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching cart:', error);
            throw error;
        }
    },

    // Orders
    async createOrder(orderData) {
        try {
            const response = await fetch(`${API_BASE_URL}/orders/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(orderData)
            });
            return await response.json();
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    },

    async getOrders() {
        try {
            const response = await fetch(`${API_BASE_URL}/orders`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    }
};

export default api; 