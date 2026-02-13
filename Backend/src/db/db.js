const mongoose = require('mongoose');

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        });
        console.log('Connected to MongoDB');
    } catch(err) {
        console.log("Error connecting to MongoDB:", err);
    }
}

module.exports = connectDB;
