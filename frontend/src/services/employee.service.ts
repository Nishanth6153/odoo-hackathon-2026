import apiClient from '../api/client';
import type {
  CreateEmployeeData,
  CreateEmployeeResponse,
  Employee,
  EmployeeProfile,
  UpdateEmployeeData,
} from '../types/employee.types';

const mapBackendEmployee = (raw: any): Employee => {
  const item = raw || {};
  return {
    id: String(item.id || item._id || ''),
    loginId: String(item.employeeId || item.loginId || item.id || ''),
    name: item.name || 'Unnamed Employee',
    email: item.user?.email || item.email || '',
    phone: item.phone || '',
    role: item.user?.role || item.role || 'EMPLOYEE',
    department: item.department || 'Engineering',
    designation: item.jobTitle || item.designation || 'Staff',
    joiningDate: item.joiningDate || item.createdAt || new Date().toISOString(),
    status: item.status || 'ACTIVE',
    profileImage: item.profilePicture || item.profileImage || null,
  };
};

export const employeeService = {
  async getEmployees(): Promise<Employee[]> {
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
        about: raw.about || (raw.address ? `Address: ${raw.address}` : undefined),
        skills: raw.skills || [],
        interests: raw.interests || [],
        certifications: raw.certifications || [],
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
        department: createData.department || undefined,
        phone: createData.phone || undefined,
        password: createData.password || 'Employee@123',
      };

      const res = await apiClient.post('/employees', payload);
      const data = res.data?.data || res.data;
      const raw = data?.employee || data;
      const employee = mapBackendEmployee(raw);

      return {
        employee,
        loginId: data?.employeeId || employee.loginId,
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
      if (updateData.department) payload.department = updateData.department;
      if (updateData.about) payload.about = updateData.about;
      if (updateData.skills) payload.skills = updateData.skills;
      if (updateData.interests) payload.interests = updateData.interests;
      if (updateData.certifications) payload.certifications = updateData.certifications;
      if (updateData.status) payload.status = updateData.status;

      const res = await apiClient.patch(`/employees/${id}`, payload);
      const data = res.data?.data || res.data;
      const raw = data?.employee || data;
      return {
        ...mapBackendEmployee(raw),
        about: raw.about,
        skills: raw.skills,
        interests: raw.interests,
        certifications: raw.certifications,
      };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to update employee profile.';
      throw new Error(message);
    }
  },

  async deleteEmployee(id: string): Promise<void> {
    try {
      await apiClient.delete(`/employees/${id}`);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to delete employee.';
      throw new Error(message);
    }
  },

  async getMyProfile(): Promise<EmployeeProfile> {
    try {
      const res = await apiClient.get('/employees/me/profile');
      const data = res.data?.data || res.data;
      const raw = data?.employee || data?.profile || data;
      return {
        ...mapBackendEmployee(raw),
        about: raw.about,
        skills: raw.skills,
        interests: raw.interests,
        certifications: raw.certifications,
      };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch personal profile.';
      throw new Error(message);
    }
  },

  async updateMyProfile(updateData: UpdateEmployeeData): Promise<EmployeeProfile> {
    const myProfile = await this.getMyProfile();
    return this.updateEmployee(myProfile.id, updateData);
  },
};
