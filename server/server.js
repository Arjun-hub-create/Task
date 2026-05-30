require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const { connectDB } = require('./config/db');
const { initSocket } = require('./config/socket');
const { generalLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const activityRoutes = require('./routes/activityRoutes');

const app = express();
const httpServer = http.createServer(app);

// Initialize Socket.io
initSocket(httpServer);

// Connect to MongoDB
connectDB();

// Security & parsing middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate limiting
app.use('/api/', generalLimiter);

// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), service: 'VOID Task Manager' });
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/activity', activityRoutes);

// Client-side routing fallback for production builds
app.get('*', (req, res, next) => {
  if (req.originalUrl.startsWith('/api/')) return next();
  if (process.env.NODE_ENV === 'production') {
    return res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  }
  return next();
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  httpServer.listen(PORT, () => {
    console.log(`
    ██╗   ██╗ ██████╗ ██╗██████╗ 
    ██║   ██║██╔═══██╗██║██╔══██╗
    ██║   ██║██║   ██║██║██║  ██║
    ╚██╗ ██╔╝██║   ██║██║██║  ██║
     ╚████╔╝ ╚██████╔╝██║██████╔╝
      ╚═══╝   ╚═════╝ ╚═╝╚═════╝ 
    🚀 VOID Server running on port ${PORT}
    🌍 Environment: ${process.env.NODE_ENV}
    `);
  });
}

module.exports = app;
