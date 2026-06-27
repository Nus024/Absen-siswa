import express from 'express';
import cors from 'cors';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import { rateLimitMiddleware } from './middlewares/rateLimitMiddleware.js';

// Import Route v1
import authRoutes from './routes/v1/auth.js';
import studentRoutes from './routes/v1/students.js';
import attendanceRoutes from './routes/v1/attendance.js';
import classRoutes from './routes/v1/classes.js';
import permissionRoutes from './routes/v1/permissions.js';
import reportRoutes from './routes/v1/reports.js';
import settingsRoutes from './routes/v1/settings.js';
import logRoutes from './routes/v1/logs.js';
import systemRoutes from './routes/v1/system.js';
import userRoutes from './routes/v1/users.js';
import sessionRoutes from './routes/v1/sessions.js';

const app = express();

// CORS dan JSON Parser
app.use(cors());
app.use(express.json());

// Rate Limiter Global (Maksimal 100 request/menit untuk satu IP)
app.use(rateLimitMiddleware(100));

// Pendaftaran endpoint API v1 sesuai panduan arsitektur
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/classes', classRoutes);
app.use('/api/v1/permissions', permissionRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/logs', logRoutes);
app.use('/api/v1/system', systemRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/sessions', sessionRoutes);

// Tangani route 404
app.use((req, res, next) => {
  const err = new Error(`Endpoint ${req.originalUrl} tidak ditemukan.`);
  err.status = 404;
  next(err);
});

// Tangkap semua error lewat middleware
app.use(errorMiddleware);

export default app;
