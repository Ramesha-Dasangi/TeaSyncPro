import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

// Import all Sequelize models so they get registered before sync
// Even if we don't use them directly here, they need to be imported
// so that Sequelize knows about all the tables when we call sync()
import User from './models/User.js';
import Employee from './models/Employee.js';
import Attendance from './models/Attendance.js';
import Supplier from './models/Supplier.js';
import SupplierPayment from './models/SupplierPayment.js';
import CollectionSchedule from './models/CollectionSchedule.js';
import DailyLeafRate from './models/DailyLeafRate.js';
import TeaCollection from './models/TeaCollection.js';
import ProductionBatch from './models/ProductionBatch.js';
import ProductionStage from './models/ProductionStage.js';
import ProductionStageLog from './models/ProductionStageLog.js';
import TeaGrade from './models/TeaGrade.js';
import FinishedOutput from './models/FinishedOutput.js';
import SalesInvoice from './models/SalesInvoice.js';

// Load environment variables from .env file first thing
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ---------------------------------------------------
// Middleware Setup
// ---------------------------------------------------

// Allow requests from the React frontend (running on a different port during dev)
app.use(cors());

// Parse incoming JSON request bodies so we can read req.body
app.use(express.json());

// ---------------------------------------------------
// Basic Health Check Route
// ---------------------------------------------------

// Simple route to check if the server is up and running
app.get('/', (req, res) => {
  res.json({ message: 'TeaSyncPro API is running!' });
});

// ---------------------------------------------------
// TODO: Add your route files here as you build them
// Example:
// import authRoutes from './routes/auth.js';
// app.use('/api/auth', authRoutes);
// ---------------------------------------------------

// ---------------------------------------------------
// Start Server and Connect to Database
// ---------------------------------------------------

const startServer = async () => {
  // First connect to MySQL - if this fails we should know before starting
  await connectDB();

  // Start listening for incoming requests
  app.listen(PORT, () => {
    console.log(`TeaSyncPro server running on http://localhost:${PORT}`);
  });
};

startServer();
