import type {
  SalaryComponentInput,
  SalaryInput,
  SalaryStructure,
} from '../types/salary.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const salaryService = {
  async getSalary(employeeId: string): Promise<SalaryStructure> {
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
    }
  },
};
