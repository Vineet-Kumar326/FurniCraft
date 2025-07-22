const express = require('express');
const router = express.Router();
const User = require('../models/usermodel');
const bcrypt = require('bcryptjs');

router.post('/register', async(req, res) => {
    try {
        console.log('Registration request received:', req.body);
        const { username, email, password } = req.body;
        
        // Input validation
        if (!username || !email || !password) {
            console.log('Missing required fields:', { username, email, password: !!password });
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Password length validation
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User already exists:', email);
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create a new user
        const newUser = new User({
            username,
            email,
            password: bcrypt.hashSync(password, 10)
        });

        await newUser.save();
        console.log('User registered successfully:', email);
        return res.status(201).json({ 
            message: 'User registered successfully',
            user: {
                username: newUser.username,
                email: newUser.email
            }
        });
    } catch (error) {
        console.error('Error registering user:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        res.status(500).json({ message: 'Internal server error' }); 
    }
});

router.post('/login', async(req, res) => {
    try {
        const { email, password } = req.body;

        // Input validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }   

        // Check if password is correct
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        // Remove password from response
        const userResponse = {
            _id: user._id,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin
        };

        return res.status(200).json({ 
            message: 'Login successful', 
            user: userResponse 
        });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;