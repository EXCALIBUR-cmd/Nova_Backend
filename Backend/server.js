require('dotenv').config();

// Enable ALL Socket.IO debug logging
require('debug').enable('socket.io:*,engine:*');

const app = require('./src/app');
const connectDB = require('./src/db/db');
const initSocketServer = require('./src/sockets/socket.server');
const http = require('http');

const httpServer = http.createServer(app);

console.log('Starting server...');
console.log('Environment check:');
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? '✓ Set' : '✗ Missing');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? '✓ Set' : '✗ Missing');
console.log('- GROQ_API_KEY:', process.env.GROQ_API_KEY ? '✓ Set' : '✗ Missing');

// Connect to MongoDB (non-blocking)
connectDB();

console.log('Initializing Socket.IO...');
const io = initSocketServer(httpServer);
console.log('Socket.IO initialized, io instance:', !!io);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log('✅ Server is running on port', PORT);
  console.log('✅ Socket.IO is listening on the httpServer');
});