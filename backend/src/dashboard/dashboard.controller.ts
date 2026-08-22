import { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service';

export class DashboardController {
  async getAdminDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await dashboardService.getAdminDashboard();

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const result = await dashboardService.getEmployeeDashboard(req.user.userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
