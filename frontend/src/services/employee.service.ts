import type {
  CreateEmployeeData,
  CreateEmployeeResponse,
  Employee,
  EmployeeProfile,
  UpdateEmployeeData,
} from '../types/employee.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const employeeService = {
  async getEmployees(): Promise<Employee[]> {
    const res = await fetch(`${API_URL}/api/employees`, {
      method: 'GET',
      headers: getHeaders(),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMessage = data?.message || data?.error || 'Failed to fetch employees list.';
      throw new Error(errorMessage);
    }

    const employees: Employee[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.employees)
      ? data.employees
      : Array.isArray(data?.data)
      ? data.data
      : [];

    return employees;
  },

  async getEmployeeById(id: string): Promise<EmployeeProfile> {
    const res = await fetch(`${API_URL}/api/employees/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMessage = data?.message || data?.error || `Failed to fetch employee details for ID ${id}.`;
      throw new Error(errorMessage);
    }

    const employee: EmployeeProfile = data?.employee || data?.data || data;
    if (!employee || !employee.id) {
      throw new Error('Invalid employee data received.');
    }

    return employee;
  },

  async createEmployee(createData: CreateEmployeeData): Promise<CreateEmployeeResponse> {
    const res = await fetch(`${API_URL}/api/employees`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(createData),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMessage = data?.message || data?.error || 'Failed to create new employee.';
      throw new Error(errorMessage);
    }

    const employee: Employee = data?.employee || data?.data || data;
    return {
      employee,
      loginId: data?.loginId || employee?.loginId,
      tempPassword: data?.tempPassword || data?.password,
      message: data?.message,
    };
  },

  async updateEmployee(id: string, updateData: UpdateEmployeeData): Promise<EmployeeProfile> {
    const res = await fetch(`${API_URL}/api/employees/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(updateData),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMessage = data?.message || data?.error || 'Failed to update employee profile.';
      throw new Error(errorMessage);
    }

    const employee: EmployeeProfile = data?.employee || data?.data || data;
    return employee;
  },

  async deleteEmployee(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/api/employees/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const errorMessage = data?.message || data?.error || 'Failed to delete employee.';
      throw new Error(errorMessage);
    }
  },

  async getMyProfile(): Promise<EmployeeProfile> {
    const res = await fetch(`${API_URL}/api/employees/me/profile`, {
      method: 'GET',
      headers: getHeaders(),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMessage = data?.message || data?.error || 'Failed to fetch personal profile.';
      throw new Error(errorMessage);
    }

    const profile: EmployeeProfile = data?.profile || data?.user || data?.data || data;
    if (!profile || (!profile.id && !profile.name)) {
      throw new Error('Invalid profile data received.');
    }

    return profile;
  },

  async updateMyProfile(updateData: UpdateEmployeeData): Promise<EmployeeProfile> {
    // Attempt PATCH /api/employees/me/profile
    const res = await fetch(`${API_URL}/api/employees/me/profile`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(updateData),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMessage = data?.message || data?.error || 'Failed to update your profile.';
      throw new Error(errorMessage);
    }

    const profile: EmployeeProfile = data?.profile || data?.user || data?.data || data;
    return profile;
  },
};
