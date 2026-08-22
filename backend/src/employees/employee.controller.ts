import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { employeeService } from './employee.service';
import { createEmployeeSchema, updateEmployeeSchema } from './employee.validation';

export class EmployeeController {
  async createEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = createEmployeeSchema.parse(req.body);
      const result = await employeeService.createEmployee(validatedInput);

      res.status(201).json({
        success: true,
        message: 'Employee created successfully',
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

  async getEmployees(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await employeeService.getEmployees();

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await employeeService.getEmployeeById(id);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const result = await employeeService.getEmployeeByUserId(req.user.userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const id = req.params.id as string;
      const validatedInput = updateEmployeeSchema.parse(req.body);

      const result = await employeeService.updateEmployee(id, req.user, validatedInput);

      res.status(200).json({
        success: true,
        message: 'Employee updated successfully',
        data: result,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation failed: Unknown or forbidden fields provided',
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
}

export const employeeController = new EmployeeController();
