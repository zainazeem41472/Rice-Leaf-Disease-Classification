import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import diseaseRoutes from './routes/disease.js';
import modelRoutes from './routes/model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ML predictions are handled by Flask service; Node does not serve TFJS models.

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/disease', diseaseRoutes);
app.use('/api/model', modelRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Rice Disease Detection API',
    version: '1.0.0',
    endpoints: {
      auth: {
        signup: 'POST /api/auth/signup',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile (Protected)',
      },
      disease: {
        upload: 'POST /api/disease/upload (Protected)',
        history: 'GET /api/disease/history (Protected)',
        getById: 'GET /api/disease/:id (Protected)',
        delete: 'DELETE /api/disease/:id (Protected)',
      },
    },
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`ML backend URL: ${process.env.ML_SERVICE_URL || 'http://localhost:5000'}`);
});