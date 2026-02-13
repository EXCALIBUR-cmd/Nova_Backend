const mongoose = require('mongoose');

async function connectDB() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI environment variable is not defined');
        }
        
        console.log('Attempting to connect to MongoDB...');
        console.log('MongoDB URI format:', process.env.MONGODB_URI.substring(0, 20) + '...');
        
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000, // Timeout after 10s
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        });
        
        console.log('✅ Connected to MongoDB successfully');
        return true;
    } catch(err) {
        console.error('❌ Error connecting to MongoDB:', err.message);
        console.error('Full error:', err);
        return false;
    }
}

module.exports = connectDB;
