export type UserRole = "ADMIN" | "HR" | "EMPLOYEE";

export interface User {
  id: string;
  email?: string;
  loginId: string;
  name: string;
  role: UserRole;
  isEmailVerified?: boolean;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email?: string;
  loginId?: string;
  password: string;
}
