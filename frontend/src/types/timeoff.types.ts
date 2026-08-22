export type TimeOffType = "PAID_TIME_OFF" | "SICK_LEAVE" | "UNPAID_LEAVE";

export type TimeOffStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface TimeOffRequest {
  id: string;
  employeeId: string;
  employeeName?: string;
  employeeEmail?: string;
  department?: string;
  type: TimeOffType;
  startDate: string;
  endDate: string;
  days?: number;
  numberOfDays?: number;
  reason: string;
  attachmentUrl?: string | null;
  status: TimeOffStatus;
  createdAt?: string;
  updatedAt?: string;
  approvedAt?: string | null;
  rejectedAt?: string | null;
}

export interface CreateTimeOffData {
  type: TimeOffType;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface LeaveBalances {
  paidTimeOff?: number;
  sickLeave?: number;
  unpaidLeave?: number;
}
