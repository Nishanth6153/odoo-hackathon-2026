import { Router } from 'express';
import { Role } from '@prisma/client';
import { employeeController } from './employee.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

// Admin-only employee creation
router.post('/', authenticate, authorize(Role.ADMIN), (req, res, next) =>
  employeeController.createEmployee(req, res, next)
);

// Admin-only employee listing
router.get('/', authenticate, authorize(Role.ADMIN), (req, res, next) =>
  employeeController.getEmployees(req, res, next)
);

// Authenticated employee self-profile route (registered BEFORE /:id to prevent route matching collisions)
router.get('/me/profile', authenticate, (req, res, next) =>
  employeeController.getEmployeeProfile(req, res, next)
);

// Admin-only get employee by ID
router.get('/:id', authenticate, authorize(Role.ADMIN), (req, res, next) =>
  employeeController.getEmployeeById(req, res, next)
);

// Authenticated update route (Admin or profile owner checked inside service)
router.patch('/:id', authenticate, (req, res, next) =>
  employeeController.updateEmployee(req, res, next)
);

export default router;
