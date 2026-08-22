export type AttendanceStatus = "PRESENT" | "ON_LEAVE" | "ABSENT" | "HALF_DAY" | "LEAVE";

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName?: string;
  employeeEmail?: string;
  department?: string;
  date: string;
  status: AttendanceStatus;
  checkIn: string | null;
  checkOut: string | null;
  workMinutes: number | null;
  extraMinutes?: number | null;
}

export interface TodayAttendance {
  id?: string;
  date: string;
  status: AttendanceStatus | null;
  checkIn: string | null;
  checkOut: string | null;
  workMinutes: number | null;
  extraMinutes?: number | null;
}
