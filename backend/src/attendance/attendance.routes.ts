import { Router } from 'express';
import { Role } from '@prisma/client';
import { attendanceController } from './attendance.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

// Employee check-in
router.post('/check-in', authenticate, (req, res, next) =>
  attendanceController.checkIn(req, res, next)
);

// Employee check-out
router.post('/check-out', authenticate, (req, res, next) =>
  attendanceController.checkOut(req, res, next)
);

// Authenticated employee today's attendance (registered BEFORE /:id to prevent route matching collision)
router.get('/me/today', authenticate, (req, res, next) =>
  attendanceController.getTodayAttendance(req, res, next)
);

// Authenticated employee attendance history (registered BEFORE /:id to prevent route matching collision)
router.get('/me', authenticate, (req, res, next) =>
  attendanceController.getEmployeeAttendanceHistory(req, res, next)
);

// Admin-only view all attendance
router.get('/', authenticate, authorize(Role.ADMIN), (req, res, next) =>
  attendanceController.getAllAttendance(req, res, next)
);

// Admin-only view attendance by ID
router.get('/:id', authenticate, authorize(Role.ADMIN), (req, res, next) =>
  attendanceController.getAttendanceById(req, res, next)
);

export default router;
