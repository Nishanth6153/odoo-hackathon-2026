export type EmployeeStatus = "ACTIVE" | "INACTIVE";

export interface Employee {
  id: string;
  loginId?: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  department?: string;
  designation?: string;
  joiningDate?: string;
  status: EmployeeStatus;
  profileImage?: string | null;
}

export interface EmployeeProfile extends Employee {
  about?: string;
  skills?: string[];
  interests?: string[];
  certifications?: string[];
}

export interface CreateEmployeeData {
  name: string;
  email: string;
  phone?: string;
  department?: string;
  designation?: string;
  joiningDate?: string;
}

export interface UpdateEmployeeData {
  name?: string;
  email?: string;
  phone?: string;
  department?: string;
  designation?: string;
  about?: string;
  skills?: string[];
  interests?: string[];
  certifications?: string[];
  status?: EmployeeStatus;
}

export interface CreateEmployeeResponse {
  employee: Employee;
  loginId?: string;
  tempPassword?: string;
  message?: string;
}
