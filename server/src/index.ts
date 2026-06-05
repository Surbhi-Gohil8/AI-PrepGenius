import dotenv from 'dotenv';
// Load environment variables first
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import 'express-async-errors'; // Handles async errors automatically
import { connectDB } from './config/db';

// Import Routes
import authRoutes from './routes/auth';
import resumeRoutes from './routes/resume';
import interviewRoutes from './routes/interview';
import transcribeRoutes from './routes/transcribe';

const app = express();
const PORT = process.env.PORT || 5000;

// Database Connection
connectDB();

// Global Middlewares
app.use(cors({
  origin: '*', // Allow all origins for dev/docker bridge networks
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads folder (if ever needed to view/retrieve uploaded resumes/audios)
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/transcribe', transcribeRoutes);

// 404 Route handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: `API route not found: ${req.method} ${req.url}` });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Error:', err);
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'An unexpected server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
