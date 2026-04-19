require('dotenv').config();

// Enable critical Socket.IO debug logging for troubleshooting
// Reduce noise in production
if (process.env.DEBUG_SOCKETIO === 'true') {
  require('debug').enable('socket.io:*,engine:*');
}

const app = require('./src/app');
const connectDB = require('./src/db/db');
const initSocketServer = require('./src/sockets/socket.server');
const http = require('http');

const httpServer = http.createServer(app);

console.log('🚀 Starting Nova Backend Server...');
console.log('📋 Environment check:');
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? '✓ Set' : '✗ Missing');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? '✓ Set' : '✗ Missing');
console.log('- GROQ_API_KEY:', process.env.GROQ_API_KEY ? '✓ Set' : '✗ Missing');
console.log('- Node Environment:', process.env.NODE_ENV || 'development');

// Initialize server startup
(async () => {
  try {
    // Connect to MongoDB with automatic retry
    console.log('\n📡 Connecting to MongoDB...');
    const dbConnected = await connectDB();
    
    if (!dbConnected) {
      console.warn('⚠️ WARNING: MongoDB connection failed. Server will continue to run but API requests will fail until connection is established.');
      console.warn('⚠️ Check if MONGODB_URI is correctly set in environment variables.');
    }
    
    // Initialize Socket.IO
    console.log('\n🔌 Initializing Socket.IO...');
    const io = initSocketServer(httpServer);
    if (io) {
      console.log('✅ Socket.IO initialized successfully');
    }
    
    // Start HTTP server
    const PORT = process.env.PORT || 3001;
    httpServer.listen(PORT, () => {
      console.log('\n✅ Server is running on port ' + PORT);
      console.log('✅ Health check available at: http://localhost:' + PORT + '/health');
      console.log('✅ API documentation at: http://localhost:' + PORT + '/\n');
    });
    
  } catch (err) {
    console.error('❌ Fatal error during server startup:', err.message);
    process.exit(1);
  }
})();

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n📴 SIGTERM received, shutting down gracefully...');
  httpServer.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});