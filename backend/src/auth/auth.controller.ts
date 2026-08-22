import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { loginSchema } from './auth.validation';
import { ZodError } from 'zod';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = loginSchema.parse(req.body);
      const result = await authService.login(validatedInput);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
        return;
      }
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required.',
        });
        return;
      }

      const result = await authService.getCurrentUser(req.user.userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
