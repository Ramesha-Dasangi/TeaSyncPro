import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

// Route imports
import collectionRoutes from './routes/collections.js';
import supplierRoutes from './routes/suppliers.js';
import batchRoutes from './routes/batches.js';
import gradingRoutes from './routes/grading.js';
import financeRoutes from './routes/finance.js';
import employeeRoutes from './routes/employees.js';
import dashboardRoutes from './routes/dashboard.js';
import authRoutes from './routes/auth.js';
import salesRoutes from './routes/sales.js';

// Load environment variables
dotenv.config();

const app = express();
let PORT = parseInt(process.env.PORT || '5000', 10);

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173')
  .split(',')
  .map(o => o.trim());

// Security Headers & Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  }
}));
app.use(express.json({ limit: '1mb' }));

// API Health Check
app.get('/', (req, res) => {
  res.json({
    status: 'ONLINE',
    message: 'TeaSyncPro Factory Management REST API is active',
    database: 'Enterprise Relational Engine (Singular Schema)',
    timestamp: new Date().toISOString()
  });
});

// Mount API routes
app.use('/api/collections', collectionRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/grading', gradingRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/sales', salesRoutes);

// Start server with port fallback
const startServer = async () => {
  try {
    await connectDB();
  } catch (err) {
    console.warn('[DB] MySQL is offline, using SQLite engine (teasyncpro.db).');
  }

  const server = app.listen(PORT, () => {
    console.log(` TeaSyncPro Backend Server listening on http://localhost:${PORT}`);
    console.log(` REST API endpoints ready under http://localhost:${PORT}/api/`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${PORT} in use, attempting port ${PORT + 1}...`);
      PORT += 1;
      app.listen(PORT, () => {
        console.log(` TeaSyncPro Backend Server listening on http://localhost:${PORT}`);
      });
    } else {
      console.error('Server error:', err);
    }
  });
};

startServer();
