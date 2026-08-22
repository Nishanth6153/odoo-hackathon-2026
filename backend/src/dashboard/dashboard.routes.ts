import { Router } from 'express';
import { Role } from '@prisma/client';
import { dashboardController } from './dashboard.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

// Admin Dashboard Analytics (Admin Only)
router.get('/admin', authenticate, authorize(Role.ADMIN), (req, res, next) =>
  dashboardController.getAdminDashboard(req, res, next)
);

// Employee Dashboard Summary (Authenticated Employee)
router.get('/employee', authenticate, (req, res, next) =>
  dashboardController.getEmployeeDashboard(req, res, next)
);

export default router;
