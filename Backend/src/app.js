const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const routes = require('./routes/auth.routes');
const chatsRoutes = require('./routes/chats.routes');
const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Socket.IO check endpoint
app.get('/socket-info', (req, res) => {
  res.json({ message: 'Socket.IO endpoint available at /socket.io/' });
});

// Test Socket.IO long-poll endpoint
app.get('/test-socket', (req, res) => {
  res.json({ 
    message: 'To test Socket.IO, try connecting to:',
    url: 'http://localhost:3001 with socket.io-client'
  });
});

// Diagnostics endpoint
app.get('/diag', (req, res) => {
  res.json({
    backend: 'ok',
    port: 3001,
    socketioAvailable: true,
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', routes);
app.use('/api/chats', chatsRoutes);
module.exports = app;