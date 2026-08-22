import { Router } from 'express';
import { Role } from '@prisma/client';
import { timeoffController } from './timeoff.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

// Employee create leave request
router.post('/', authenticate, (req, res, next) =>
  timeoffController.createLeaveRequest(req, res, next)
);

// Authenticated employee leave history (registered BEFORE /:id to prevent route matching collision)
router.get('/me', authenticate, (req, res, next) =>
  timeoffController.getEmployeeLeaveHistory(req, res, next)
);

// Admin-only view all leave requests
router.get('/', authenticate, authorize(Role.ADMIN), (req, res, next) =>
  timeoffController.getAllLeaveRequests(req, res, next)
);

// Admin-only view leave request by ID
router.get('/:id', authenticate, authorize(Role.ADMIN), (req, res, next) =>
  timeoffController.getLeaveRequestById(req, res, next)
);

// Admin-only approve leave request
router.patch('/:id/approve', authenticate, authorize(Role.ADMIN), (req, res, next) =>
  timeoffController.approveLeaveRequest(req, res, next)
);

// Admin-only reject leave request
router.patch('/:id/reject', authenticate, authorize(Role.ADMIN), (req, res, next) =>
  timeoffController.rejectLeaveRequest(req, res, next)
);

export default router;
