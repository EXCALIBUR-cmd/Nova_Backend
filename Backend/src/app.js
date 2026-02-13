const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const routes = require('./routes/auth.routes');
const chatsRoutes = require('./routes/chats.routes');
const app = express();

// CORS configuration - handle multiple origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://nova-frontend-x3w-onrender.com',
  'https://nova-frontend-x3wr.onrender.com',
  'https://nova-backend-ixcc.onrender.com',
  'https://nova-backend-1xcc-onrender.com',
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// Root endpoint - Welcome message
app.get('/', (req, res) => {
  res.json({ 
    message: 'Nova Backend API', 
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      chats: '/api/chats'
    }
  });
});

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