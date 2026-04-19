const mongoose = require('mongoose');

// Connection retry configuration
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 2000; // 2 seconds
const MAX_RETRY_DELAY = 30000; // 30 seconds
let retryCount = 0;

async function connectDB() {
    return new Promise((resolve) => {
        const attemptConnection = async () => {
            try {
                if (!process.env.MONGODB_URI) {
                    throw new Error('MONGODB_URI environment variable is not defined');
                }
                
                console.log(`[DB] Attempting to connect to MongoDB (Attempt ${retryCount + 1}/${MAX_RETRIES})...`);
                
                const mongooseInstance = await mongoose.connect(process.env.MONGODB_URI, {
                    // Connection timeout settings
                    serverSelectionTimeoutMS: 30000, // Increased to 30s for initial connection
                    socketTimeoutMS: 45000,
                    
                    // Connection pooling for production
                    maxPoolSize: 10,
                    minPoolSize: 5,
                    
                    // Retry logic built into driver
                    retryWrites: true,
                    retryReads: true,
                    monitorCommands: false,
                    
                    ssl: process.env.MONGODB_URI.includes('mongodb+srv'),
                    
                    // Additional reliability settings
                    connectTimeoutMS: 30000,
                    waitQueueTimeoutMS: 10000,
                    
                    // Family: 4 forces IPv4 (helps with DNS issues)
                    family: 4,
                });
                
                console.log('✅ Connected to MongoDB successfully');
                
                // Set up connection event handlers
                mongoose.connection.on('disconnected', handleDisconnection);
                mongoose.connection.on('error', handleConnectionError);
                
                retryCount = 0; // Reset retry counter on successful connection
                resolve(true);
                
            } catch(err) {
                console.error(`❌ MongoDB connection error (Attempt ${retryCount + 1}):`);
                console.error('Message:', err.message);
                
                if (retryCount < MAX_RETRIES) {
                    retryCount++;
                    const delayMs = Math.min(
                        INITIAL_RETRY_DELAY * Math.pow(2, retryCount - 1),
                        MAX_RETRY_DELAY
                    );
                    console.log(`⏳ Retrying in ${delayMs / 1000}s...`);
                    
                    setTimeout(attemptConnection, delayMs);
                } else {
                    console.error('❌ Max retries reached. Failed to connect to MongoDB.');
                    resolve(false);
                }
            }
        };
        
        attemptConnection();
    });
}

// Handle unexpected disconnections
function handleDisconnection() {
    console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
    setTimeout(() => {
        if (mongoose.connection.readyState === 0) {
            connectDB();
        }
    }, 5000);
}

// Handle connection errors
function handleConnectionError(err) {
    console.error('❌ MongoDB connection error event:', err.message);
}

// Health check function
async function checkDBConnection() {
    try {
        await mongoose.connection.db.admin().ping();
        return true;
    } catch (err) {
        console.error('❌ Database health check failed:', err.message);
        return false;
    }
}

module.exports = connectDB;
module.exports.checkDBConnection = checkDBConnection;
