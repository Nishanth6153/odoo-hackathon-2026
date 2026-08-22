export type UserRole = "ADMIN" | "HR" | "EMPLOYEE";

export interface User {
  id: string;
<<<<<<< HEAD
  email?: string;
  loginId: string;
  name: string;
  role: UserRole;
  isEmailVerified?: boolean;
=======
  loginId: string;
  name: string;
  role: UserRole;
>>>>>>> origin/main
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
<<<<<<< HEAD
  email?: string;
  loginId?: string;
=======
  loginId: string;
>>>>>>> origin/main
  password: string;
}
