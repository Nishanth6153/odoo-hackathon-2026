export type UserRole = "ADMIN" | "HR" | "EMPLOYEE";

export interface User {
  id: string;
  loginId: string;
  name: string;
  role: UserRole;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  loginId: string;
  password: string;
}
