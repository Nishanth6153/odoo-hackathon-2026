<<<<<<< HEAD
import apiClient from '../api/client';
=======
>>>>>>> origin/main
import type {
  CreateEmployeeData,
  CreateEmployeeResponse,
  Employee,
  EmployeeProfile,
  UpdateEmployeeData,
} from '../types/employee.types';

<<<<<<< HEAD
const mapBackendEmployee = (item: any): Employee => {
  return {
    id: item.id || '',
    loginId: item.employeeId || item.id,
    name: item.name || 'Unnamed Employee',
    email: item.user?.email || item.email || '',
    phone: item.phone || '',
    role: item.user?.role || item.role || 'EMPLOYEE',
    department: item.department || 'Engineering',
    designation: item.jobTitle || item.designation || 'Staff',
    joiningDate: item.createdAt || new Date().toISOString(),
    status: item.status || 'ACTIVE',
    profileImage: item.profilePicture || null,
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

export const employeeService = {
  async getEmployees(): Promise<Employee[]> {
<<<<<<< HEAD
    try {
      const res = await apiClient.get('/employees');
      const data = res.data?.data || res.data;
      const rawList = Array.isArray(data?.employees) ? data.employees : Array.isArray(data) ? data : [];
      return rawList.map(mapBackendEmployee);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch employees list.';
      throw new Error(message);
    }
  },

  async getEmployeeById(id: string): Promise<EmployeeProfile> {
    try {
      const res = await apiClient.get(`/employees/${id}`);
      const data = res.data?.data || res.data;
      const raw = data?.employee || data;
      const base = mapBackendEmployee(raw);
      return {
        ...base,
        about: raw.address ? `Address: ${raw.address}` : undefined,
      };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || `Failed to fetch employee details for ID ${id}.`;
      throw new Error(message);
    }
  },

  async createEmployee(createData: CreateEmployeeData & { password?: string }): Promise<CreateEmployeeResponse> {
    try {
      const payload = {
        email: createData.email,
        name: createData.name,
        jobTitle: createData.designation || 'Staff',
        phone: createData.phone || undefined,
        password: createData.password || 'Employee@123',
      };

      const res = await apiClient.post('/employees', payload);
      const data = res.data?.data || res.data;
      const employee = mapBackendEmployee(data);

      return {
        employee,
        loginId: data.employeeId || employee.loginId,
        tempPassword: payload.password,
        message: res.data?.message || 'Employee created successfully',
      };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to create new employee.';
      throw new Error(message);
    }
  },

  async updateEmployee(id: string, updateData: UpdateEmployeeData): Promise<EmployeeProfile> {
    try {
      const payload: Record<string, any> = {};
      if (updateData.name) payload.name = updateData.name;
      if (updateData.phone) payload.phone = updateData.phone;
      if (updateData.designation) payload.jobTitle = updateData.designation;

      const res = await apiClient.patch(`/employees/${id}`, payload);
      const data = res.data?.data || res.data;
      const raw = data?.employee || data;
      return mapBackendEmployee(raw);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to update employee profile.';
      throw new Error(message);
=======
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
>>>>>>> origin/main
    }
  },

  async getMyProfile(): Promise<EmployeeProfile> {
<<<<<<< HEAD
    try {
      const res = await apiClient.get('/employees/me/profile');
      const data = res.data?.data || res.data;
      const raw = data?.employee || data;
      return mapBackendEmployee(raw);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch personal profile.';
      throw new Error(message);
    }
  },

  async updateMyProfile(updateData: UpdateEmployeeData): Promise<EmployeeProfile> {
    const myProfile = await this.getMyProfile();
    return this.updateEmployee(myProfile.id, updateData);
=======
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
>>>>>>> origin/main
  },
};
