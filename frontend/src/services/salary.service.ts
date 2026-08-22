import apiClient from '../api/client';
import type {
  SalaryComponentInput,
  SalaryInput,
  SalaryStructure,
} from '../types/salary.types';

const mapBackendSalary = (data: any, employeeId: string): SalaryStructure => {
  const sal = data?.salary || data;
  const rawComponents = Array.isArray(sal?.components) ? sal.components : [];

  return {
    employeeId: data?.employee?.employeeId || sal?.employeeId || employeeId,
    monthlyWage: sal?.baseSalary || sal?.monthlyWage || 0,
    yearlyWage: (sal?.baseSalary || sal?.monthlyWage || 0) * 12,
    workingDays: 22,
    components: rawComponents.map((c: any) => ({
      id: c.id,
      name: c.name,
      category: c.category,
      calculationType: c.calculationType,
      value: c.value,
      calculatedAmount: c.amount,
    })),
    totalEarnings: sal?.allowances || sal?.totalEarnings || 0,
    totalDeductions: sal?.deductions || sal?.totalDeductions || 0,
    netMonthlyAmount: sal?.netSalary || sal?.netMonthlyAmount || 0,
  };
};

export const salaryService = {
  async getSalary(employeeId: string): Promise<SalaryStructure> {
    try {
      const res = await apiClient.get(`/salary/${employeeId}`);
      const resData = res.data?.data || res.data;
      return mapBackendSalary(resData, employeeId);
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Failed to fetch salary structure.';
      throw new Error(message);
    }
  },

  async getMySalary(): Promise<SalaryStructure> {
    try {
      const res = await apiClient.get('/salary/me');
      const resData = res.data?.data || res.data;
      return mapBackendSalary(resData, 'me');
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Salary information not available.';
      throw new Error(message);
    }
  },

  async createSalary(employeeId: string, data: SalaryInput): Promise<SalaryStructure> {
    try {
      const payload = {
        baseSalary: data.monthlyWage,
      };

      const res = await apiClient.post(`/salary/${employeeId}`, payload);
      const resData = res.data?.data || res.data;
      return mapBackendSalary(resData, employeeId);
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Failed to create salary structure.';
      throw new Error(message);
    }
  },

  async updateSalary(employeeId: string, data: SalaryInput): Promise<SalaryStructure> {
    try {
      const payload = {
        baseSalary: data.monthlyWage,
      };

      const res = await apiClient.patch(`/salary/${employeeId}`, payload);
      const resData = res.data?.data || res.data;
      return mapBackendSalary(resData, employeeId);
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Failed to update salary configuration.';
      throw new Error(message);
    }
  },

  async addSalaryComponent(employeeId: string, data: SalaryComponentInput): Promise<SalaryStructure> {
    try {
      const payload = {
        name: data.name,
        category: data.category,
        calculationType: data.calculationType,
        value: Number(data.value),
      };

      const res = await apiClient.post(`/salary/${employeeId}/components`, payload);
      const resData = res.data?.data || res.data;
      return mapBackendSalary(resData, employeeId);
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Failed to add salary component.';
      throw new Error(message);
    }
  },

  async updateSalaryComponent(componentId: string, data: Partial<SalaryComponentInput>): Promise<SalaryStructure> {
    try {
      const res = await apiClient.patch(`/salary/components/${componentId}`, data);
      const resData = res.data?.data || res.data;
      return mapBackendSalary(resData, '');
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Failed to update salary component.';
      throw new Error(message);
    }
  },

  async deleteSalaryComponent(componentId: string): Promise<void> {
    try {
      await apiClient.delete(`/salary/components/${componentId}`);
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Failed to delete salary component.';
      throw new Error(message);
    }
  },
};
