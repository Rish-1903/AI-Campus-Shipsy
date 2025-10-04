const express = require('express');
const cors = require('cors');
const path = require('path');
require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// GUARANTEED CORS FIX - Allow all origins in development
app.use(cors({
  origin: function (origin, callback) {
    // Allow ALL origins during development
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());

// Import routes
const { register, login } = require('./auth');
const tasksRouter = require('./tasks');

// Try to load AI routes
let aiRoutes;
try {
  aiRoutes = require('./routes/ai-routes');
  console.log('✅ AI routes loaded');
} catch (error) {
  console.log('❌ AI routes not found, creating basic ones');
  aiRoutes = express.Router();
  aiRoutes.get('/test', (req, res) => {
    res.json({ message: 'AI endpoint working' });
  });
}

// Routes
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.use('/api/tasks', tasksRouter);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AI Campus Assignment API is running',
    timestamp: new Date().toISOString(),
    cors: 'enabled-all-origins'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'AI Campus Assignment Backend',
    endpoints: {
      health: 'GET /api/health',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      tasks: 'GET/POST/PUT/DELETE /api/tasks',
      ai: 'GET /api/ai/analysis'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 CORS: Enabled for ALL origins`);
  console.log(`📍 Health: http://localhost:${PORT}/api/health`);
});
