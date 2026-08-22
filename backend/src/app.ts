import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { env } from './config/env';
import authRouter from './auth/auth.routes';
import employeeRouter from './employees/employee.routes';
import attendanceRouter from './attendance/attendance.routes';
import timeoffRouter from './timeoff/timeoff.routes';
import salaryRouter from './salary/salary.routes';
import { notFoundHandler } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';

const app: Application = express();

// Global Middlewares
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check API Endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'Dayflow backend is running',
  });
});

// Authentication Routes
app.use('/api/auth', authRouter);

// Employee Management Routes
app.use('/api/employees', employeeRouter);

// Attendance Routes
app.use('/api/attendance', attendanceRouter);

// Time Off / Leave Management Routes
app.use('/api/timeoff', timeoffRouter);

// Salary Information Routes
app.use('/api/salary', salaryRouter);

// 404 Not Found Middleware
app.use(notFoundHandler);

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
