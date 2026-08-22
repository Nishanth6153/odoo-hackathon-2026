import type { AttendanceRecord, TodayAttendance } from '../types/attendance.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

    const record: TodayAttendance = data?.attendance || data?.data || data;
    return record;
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

    const record: TodayAttendance = data?.attendance || data?.data || data;
    return record;
  },

  async getMyTodayAttendance(): Promise<TodayAttendance | null> {
    const res = await fetch(`${API_URL}/api/attendance/me/today`, {
      method: 'GET',
      headers: getHeaders(),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      // If 404 or no record today, return null or empty object without throwing error
      if (res.status === 404) return null;
      const errorMessage = data?.message || data?.error || 'Failed to fetch today\'s attendance status.';
      throw new Error(errorMessage);
    }

    if (!data || Object.keys(data).length === 0) return null;

    const record: TodayAttendance = data?.attendance || data?.data || data;
    return record;
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

    const records: AttendanceRecord[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.attendance)
      ? data.attendance
      : Array.isArray(data?.data)
      ? data.data
      : [];

    return records;
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

    const records: AttendanceRecord[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.attendance)
      ? data.attendance
      : Array.isArray(data?.data)
      ? data.data
      : [];

    return records;
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

    const record: AttendanceRecord = data?.attendance || data?.data || data;
    return record;
  },
};
