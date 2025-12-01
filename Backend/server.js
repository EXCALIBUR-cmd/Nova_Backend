require('dotenv').config();

// Enable ALL Socket.IO debug logging
require('debug').enable('socket.io:*,engine:*');

const app = require('./src/app');
const connectDB = require('./src/db/db');
const initSocketServer = require('./src/sockets/socket.server');
const http = require('http');

const httpServer = http.createServer(app);

console.log('Starting server...');
connectDB();

console.log('Initializing Socket.IO...');
const io = initSocketServer(httpServer);
console.log('Socket.IO initialized, io instance:', !!io);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log('Server is running on port', PORT);
  console.log('Socket.IO is listening on the httpServer');
});