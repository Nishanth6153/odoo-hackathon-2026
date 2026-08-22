import { Router } from 'express';
import { Role } from '@prisma/client';
import { salaryController } from './salary.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

// Component routes (registered BEFORE /:employeeId to prevent route matching collisions)
router.patch('/components/:id', authenticate, authorize(Role.ADMIN), (req, res, next) =>
  salaryController.updateComponent(req, res, next)
);

router.delete('/components/:id', authenticate, authorize(Role.ADMIN), (req, res, next) =>
  salaryController.deleteComponent(req, res, next)
);

// Employee salary component addition
router.post('/:employeeId/components', authenticate, authorize(Role.ADMIN), (req, res, next) =>
  salaryController.addComponent(req, res, next)
);

// Employee salary CRUD routes
router.get('/:employeeId', authenticate, authorize(Role.ADMIN), (req, res, next) =>
  salaryController.getSalary(req, res, next)
);

router.post('/:employeeId', authenticate, authorize(Role.ADMIN), (req, res, next) =>
  salaryController.createSalary(req, res, next)
);

router.patch('/:employeeId', authenticate, authorize(Role.ADMIN), (req, res, next) =>
  salaryController.updateSalary(req, res, next)
);

export default router;
