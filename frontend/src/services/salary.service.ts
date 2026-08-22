<<<<<<< HEAD
import apiClient from '../api/client';
=======
>>>>>>> origin/main
import type {
  SalaryComponentInput,
  SalaryInput,
  SalaryStructure,
} from '../types/salary.types';

<<<<<<< HEAD
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
=======
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
>>>>>>> origin/main
  };
};

export const salaryService = {
  async getSalary(employeeId: string): Promise<SalaryStructure> {
<<<<<<< HEAD
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
=======
    const res = await fetch(`${API_URL}/api/salary/${employeeId}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    const resData = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMessage = resData?.message || resData?.error || 'Failed to fetch salary structure.';
      throw new Error(errorMessage);
    }

    const structure: SalaryStructure = resData?.salary || resData?.data || resData;
    return {
      employeeId: structure.employeeId || employeeId,
      monthlyWage: structure.monthlyWage || 0,
      yearlyWage: structure.yearlyWage || (structure.monthlyWage ? structure.monthlyWage * 12 : 0),
      workingDays: structure.workingDays || 22,
      components: Array.isArray(structure.components) ? structure.components : [],
      totalEarnings: structure.totalEarnings,
      totalDeductions: structure.totalDeductions,
      netMonthlyAmount: structure.netMonthlyAmount,
    };
  },

  async createSalary(employeeId: string, data: SalaryInput): Promise<SalaryStructure> {
    const res = await fetch(`${API_URL}/api/salary/${employeeId}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    const resData = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMessage = resData?.message || resData?.error || 'Failed to create salary structure.';
      throw new Error(errorMessage);
    }

    const structure: SalaryStructure = resData?.salary || resData?.data || resData;
    return structure;
  },

  async updateSalary(employeeId: string, data: SalaryInput): Promise<SalaryStructure> {
    const res = await fetch(`${API_URL}/api/salary/${employeeId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    const resData = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMessage = resData?.message || resData?.error || 'Failed to update salary configuration.';
      throw new Error(errorMessage);
    }

    const structure: SalaryStructure = resData?.salary || resData?.data || resData;
    return structure;
  },

  async addSalaryComponent(employeeId: string, data: SalaryComponentInput): Promise<SalaryStructure> {
    const res = await fetch(`${API_URL}/api/salary/${employeeId}/components`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    const resData = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMessage = resData?.message || resData?.error || 'Failed to add salary component.';
      throw new Error(errorMessage);
    }

    const structure: SalaryStructure = resData?.salary || resData?.data || resData;
    return structure;
  },

  async updateSalaryComponent(componentId: string, data: Partial<SalaryComponentInput>): Promise<SalaryStructure> {
    const res = await fetch(`${API_URL}/api/salary/components/${componentId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    const resData = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMessage = resData?.message || resData?.error || 'Failed to update salary component.';
      throw new Error(errorMessage);
    }

    const structure: SalaryStructure = resData?.salary || resData?.data || resData;
    return structure;
  },

  async deleteSalaryComponent(componentId: string): Promise<void> {
    const res = await fetch(`${API_URL}/api/salary/components/${componentId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!res.ok) {
      const resData = await res.json().catch(() => ({}));
      const errorMessage = resData?.message || resData?.error || 'Failed to delete salary component.';
      throw new Error(errorMessage);
>>>>>>> origin/main
    }
  },
};
