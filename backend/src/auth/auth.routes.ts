import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// Public routes
router.post('/login', (req, res, next) => authController.login(req, res, next));

// Protected routes
router.get('/me', authenticate, (req, res, next) => authController.me(req, res, next));

export default router;
