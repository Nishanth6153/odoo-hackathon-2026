import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { salaryService } from './salary.service';
import {
  createSalarySchema,
  updateSalarySchema,
  createComponentSchema,
  updateComponentSchema,
} from './salary.validation';

export class SalaryController {
  async getSalary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const employeeId = req.params.employeeId as string;
      const result = await salaryService.getSalary(employeeId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async createSalary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const employeeId = req.params.employeeId as string;
      const validatedInput = createSalarySchema.parse(req.body);

      const result = await salaryService.createSalary(employeeId, validatedInput);

      res.status(201).json({
        success: true,
        message: 'Salary record created successfully',
        data: result,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation failed: Client-supplied calculated fields (allowances, deductions, netSalary) or employeeId are strictly forbidden',
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

  async updateSalary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const employeeId = req.params.employeeId as string;
      const validatedInput = updateSalarySchema.parse(req.body);

      const result = await salaryService.updateSalary(employeeId, validatedInput);

      res.status(200).json({
        success: true,
        message: 'Salary record updated successfully',
        data: result,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation failed: Client-supplied calculated fields (allowances, deductions, netSalary) or employeeId are strictly forbidden',
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

  async addComponent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const employeeId = req.params.employeeId as string;
      const validatedInput = createComponentSchema.parse(req.body);

      const result = await salaryService.addComponent(employeeId, validatedInput);

      res.status(201).json({
        success: true,
        message: 'Salary component added successfully',
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

  async updateComponent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const targetEmployeeIdentifier = req.query.employeeId as string | undefined;
      const validatedInput = updateComponentSchema.parse(req.body);

      const result = await salaryService.updateComponent(id, validatedInput, targetEmployeeIdentifier);

      res.status(200).json({
        success: true,
        message: 'Salary component updated successfully',
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

  async deleteComponent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const targetEmployeeIdentifier = req.query.employeeId as string | undefined;

      const result = await salaryService.deleteComponent(id, targetEmployeeIdentifier);

      res.status(200).json({
        success: true,
        message: 'Salary component deleted successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const salaryController = new SalaryController();
