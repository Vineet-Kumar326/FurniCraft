const mongoose = require('mongoose');
// const dotenv = require('dotenv');
async function connectDB() {
    
    try {
        await mongoose.connect('mongodb://localhost:27017/Project');
        console.log('MongoDB connected successfully!');
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
}
module.exports = connectDB;