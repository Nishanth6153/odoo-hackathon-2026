import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { timeoffService } from './timeoff.service';
import { createLeaveRequestSchema, approveRejectLeaveSchema } from './timeoff.validation';

export class TimeOffController {
  async createLeaveRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const validatedInput = createLeaveRequestSchema.parse(req.body);
      const result = await timeoffService.createLeaveRequest(req.user.userId, validatedInput);

      res.status(201).json({
        success: true,
        message: 'Leave request submitted successfully',
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

  async getEmployeeLeaveHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const result = await timeoffService.getEmployeeLeaveHistory(req.user.userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllLeaveRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await timeoffService.getAllLeaveRequests();

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getLeaveRequestById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await timeoffService.getLeaveRequestById(id);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async approveLeaveRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const validatedInput = approveRejectLeaveSchema.parse(req.body);

      const result = await timeoffService.approveLeaveRequest(id, validatedInput);

      res.status(200).json({
        success: true,
        message: 'Leave request approved successfully',
        data: result,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation failed: Client-supplied parameters (e.g. status, employeeId, leaveType) are strictly forbidden',
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

  async rejectLeaveRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const validatedInput = approveRejectLeaveSchema.parse(req.body);

      const result = await timeoffService.rejectLeaveRequest(id, validatedInput);

      res.status(200).json({
        success: true,
        message: 'Leave request rejected successfully',
        data: result,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation failed: Client-supplied parameters (e.g. status, employeeId, leaveType) are strictly forbidden',
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

export const timeoffController = new TimeOffController();
