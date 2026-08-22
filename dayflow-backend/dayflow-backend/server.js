require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./database/database');
const { errorMiddleware, notFoundMiddleware } = require('./middleware/errorMiddleware');

// Route Handlers
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const wellnessRoutes = require('./routes/wellnessRoutes');
const alertRoutes = require('./routes/alertRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reportRoutes = require('./routes/reportRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const holidayRoutes = require('./routes/holidayRoutes');
const taskRoutes = require('./routes/taskRoutes');
const documentRoutes = require('./routes/documentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// 1. CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman) or matching FRONTEND_URL
    if (!origin || origin === FRONTEND_URL || origin === 'http://localhost:5173' || origin === 'http://localhost:3000') {
      callback(null, true);
    } else {
      callback(null, true); // Permissive in dev to ensure smooth React frontend connection
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// 2. Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'DayFlow API is running'
  });
});

// Root helper redirect/info
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'DayFlow HRMS Backend Server',
    healthCheck: '/api/health',
    documentation: 'See README.md for endpoint list'
  });
});

// 4. Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/wellness', wellnessRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/documents', documentRoutes);

// 5. 404 & Central Error Handling Middleware
app.use(notFoundMiddleware);
app.use(errorMiddleware);

// 6. Database Initialization & Server Startup
try {
  initDatabase();
  console.log('[Database] Database tables initialized and verified.');
} catch (dbErr) {
  console.error('[Database Error] Failed to initialize SQLite database:', dbErr.message);
  process.exit(1);
}

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  🚀 DayFlow HRMS Backend is running on port ${PORT}`);
    console.log(`  🌐 Base API URL: http://localhost:${PORT}/api`);
    console.log(`  🩺 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`  🔒 CORS Allowed: ${FRONTEND_URL}`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
