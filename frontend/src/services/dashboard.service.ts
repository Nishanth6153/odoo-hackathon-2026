import apiClient from '../api/client';
import type { AdminDashboardData, EmployeeDashboardData } from '../types/dashboard.types';

export const dashboardService = {
  async getAdminDashboard(): Promise<AdminDashboardData> {
    try {
      const res = await apiClient.get('/dashboard/admin');
      const data = res.data?.data || res.data;
      return data as AdminDashboardData;
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Failed to fetch Admin dashboard analytics.';
      throw new Error(message);
    }
  },

  async getEmployeeDashboard(): Promise<EmployeeDashboardData> {
    try {
      const res = await apiClient.get('/dashboard/employee');
      const data = res.data?.data || res.data;
      return data as EmployeeDashboardData;
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Failed to fetch Employee dashboard summary.';
      throw new Error(message);
    }
  },
};
