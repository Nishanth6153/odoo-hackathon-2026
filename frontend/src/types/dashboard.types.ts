export interface AdminDashboardData {
  employees: {
    total: number;
  };
  attendance: {
    presentToday: number;
    notCheckedInToday: number;
    onLeaveToday: number;
    attendanceRate: number;
  };
  leave: {
    pending: number;
    approvedToday: number;
    rejectedToday: number;
  };
  salary: {
    employeesWithSalary: number;
    totalBaseSalary: number;
    totalNetSalary: number;
  };
}

export interface EmployeeDashboardData {
  profile: {
    id: string;
    employeeId: string;
    name: string;
    phone?: string | null;
    address?: string | null;
    jobTitle: string;
    profilePicture?: string | null;
    user: {
      id: string;
      email: string;
      role: string;
    };
  };
  attendance: {
    today: {
      id: string;
      date: string;
      checkIn: string | null;
      checkOut: string | null;
      status: string;
      workMinutes: number | null;
    } | null;
    recent: Array<{
      id: string;
      date: string;
      checkIn: string | null;
      checkOut: string | null;
      status: string;
      workMinutes: number | null;
    }>;
  };
  timeOff: {
    pending: number;
    approved: number;
    rejected: number;
    recent: Array<{
      id: string;
      leaveType: string;
      startDate: string;
      endDate: string;
      remarks?: string | null;
      status: string;
      adminComment?: string | null;
      days: number;
      createdAt: string;
    }>;
  };
}
