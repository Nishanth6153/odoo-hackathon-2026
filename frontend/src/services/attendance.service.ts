import type { AttendanceRecord, TodayAttendance } from '../types/attendance.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const normalizeAttendance = (raw: Record<string, unknown>): AttendanceRecord => {
  const item = raw || {};
  const emp = (item.employee || item.user || {}) as Record<string, unknown>;

  return {
    id: String(item.id || item._id || ''),
    employeeId: String(item.employeeId || item.employee_id || item.userId || item.user_id || emp.id || ''),
    employeeName: String(item.employeeName || item.employee_name || emp.name || item.name || ''),
    employeeEmail: String(item.employeeEmail || item.employee_email || emp.email || item.email || ''),
    department: String(item.department || emp.department || ''),
    date: String(item.date || item.createdAt || item.created_at || ''),
    status: (item.status as AttendanceRecord['status']) || 'PRESENT',
    checkIn: (item.checkIn || item.check_in || item.checkInTime || item.check_in_time || null) as string | null,
    checkOut: (item.checkOut || item.check_out || item.checkOutTime || item.check_out_time || null) as string | null,
    workMinutes: typeof item.workMinutes === 'number' ? item.workMinutes : typeof item.work_minutes === 'number' ? item.work_minutes : null,
    extraMinutes: typeof item.extraMinutes === 'number' ? item.extraMinutes : typeof item.extra_minutes === 'number' ? item.extra_minutes : null,
  };
};

export const attendanceService = {
  async checkIn(): Promise<TodayAttendance> {
    const res = await fetch(`${API_URL}/api/attendance/check-in`, {
      method: 'POST',
      headers: getHeaders(),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMessage = data?.message || data?.error || 'Check-in failed. You may already be checked in.';
      throw new Error(errorMessage);
    }

    const rawRecord = (data?.attendance || data?.data || data) as Record<string, unknown>;
    return normalizeAttendance(rawRecord);
  },

  async checkOut(): Promise<TodayAttendance> {
    const res = await fetch(`${API_URL}/api/attendance/check-out`, {
      method: 'POST',
      headers: getHeaders(),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMessage = data?.message || data?.error || 'Check-out failed. No active check-in record found.';
      throw new Error(errorMessage);
    }

    const rawRecord = (data?.attendance || data?.data || data) as Record<string, unknown>;
    return normalizeAttendance(rawRecord);
  },

  async getMyTodayAttendance(): Promise<TodayAttendance | null> {
    const res = await fetch(`${API_URL}/api/attendance/me/today`, {
      method: 'GET',
      headers: getHeaders(),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 404) return null;
      const errorMessage = data?.message || data?.error || 'Failed to fetch today\'s attendance status.';
      throw new Error(errorMessage);
    }

    if (!data || Object.keys(data).length === 0) return null;

    const rawRecord = (data?.attendance || data?.data || data) as Record<string, unknown>;
    if (!rawRecord || (!rawRecord.id && !rawRecord.checkIn && !rawRecord.check_in)) return null;

    return normalizeAttendance(rawRecord);
  },

  async getMyAttendance(): Promise<AttendanceRecord[]> {
    const res = await fetch(`${API_URL}/api/attendance/me`, {
      method: 'GET',
      headers: getHeaders(),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMessage = data?.message || data?.error || 'Failed to fetch attendance history.';
      throw new Error(errorMessage);
    }

    const rawRecords = Array.isArray(data)
      ? data
      : Array.isArray(data?.attendance)
      ? data.attendance
      : Array.isArray(data?.data)
      ? data.data
      : [];

    return rawRecords.map(normalizeAttendance);
  },

  async getAttendance(): Promise<AttendanceRecord[]> {
    const res = await fetch(`${API_URL}/api/attendance`, {
      method: 'GET',
      headers: getHeaders(),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMessage = data?.message || data?.error || 'Failed to fetch attendance records.';
      throw new Error(errorMessage);
    }

    const rawRecords = Array.isArray(data)
      ? data
      : Array.isArray(data?.attendance)
      ? data.attendance
      : Array.isArray(data?.data)
      ? data.data
      : [];

    return rawRecords.map(normalizeAttendance);
  },

  async getAttendanceById(id: string): Promise<AttendanceRecord> {
    const res = await fetch(`${API_URL}/api/attendance/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMessage = data?.message || data?.error || `Failed to fetch attendance record for ID ${id}.`;
      throw new Error(errorMessage);
    }

    const rawRecord = (data?.attendance || data?.data || data) as Record<string, unknown>;
    return normalizeAttendance(rawRecord);
  },
};
