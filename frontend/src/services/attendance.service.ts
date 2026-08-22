import apiClient from '../api/client';
import type { AttendanceRecord, TodayAttendance } from '../types/attendance.types';

const mapBackendAttendance = (item: any): AttendanceRecord => {
  const emp = item?.employee || {};
  return {
    id: item?.id || '',
    employeeId: emp?.employeeId || item?.employeeId || '',
    employeeName: emp?.name || item?.employeeName || 'Staff Member',
    employeeEmail: emp?.user?.email || item?.employeeEmail || '',
    department: emp?.jobTitle || 'Engineering',
    date: item?.date || new Date().toISOString(),
    status: item?.status || 'PRESENT',
    checkIn: item?.checkIn || null,
    checkOut: item?.checkOut || null,
    workMinutes: typeof item?.workMinutes === 'number' ? item.workMinutes : null,
  };
};

export const attendanceService = {
  async checkIn(): Promise<TodayAttendance> {
    try {
      const res = await apiClient.post('/attendance/check-in', {});
      const data = res.data?.data?.attendance || res.data?.data || res.data;
      return mapBackendAttendance(data);
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Check-in failed. You may already be checked in.';
      throw new Error(message);
    }
  },

  async checkOut(): Promise<TodayAttendance> {
    try {
      const res = await apiClient.post('/attendance/check-out', {});
      const data = res.data?.data?.attendance || res.data?.data || res.data;
      return mapBackendAttendance(data);
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Check-out failed. No active check-in record found.';
      throw new Error(message);
    }
  },

  async getMyTodayAttendance(): Promise<TodayAttendance | null> {
    try {
      const res = await apiClient.get('/attendance/me/today');
      const data = res.data?.data?.attendance;
      if (!data) return null;
      return mapBackendAttendance(data);
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch today's attendance status.";
      throw new Error(message);
    }
  },

  async getMyAttendance(): Promise<AttendanceRecord[]> {
    try {
      const res = await apiClient.get('/attendance/me');
      const data = res.data?.data || res.data;
      const list = Array.isArray(data?.attendance) ? data.attendance : Array.isArray(data) ? data : [];
      return list.map(mapBackendAttendance);
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Failed to fetch attendance history.';
      throw new Error(message);
    }
  },

  async getAttendance(): Promise<AttendanceRecord[]> {
    try {
      const res = await apiClient.get('/attendance');
      const data = res.data?.data || res.data;
      const list = Array.isArray(data?.attendance) ? data.attendance : Array.isArray(data) ? data : [];
      return list.map(mapBackendAttendance);
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Failed to fetch attendance records.';
      throw new Error(message);
    }
  },

  async getAttendanceById(id: string): Promise<AttendanceRecord> {
    try {
      const res = await apiClient.get(`/attendance/${id}`);
      const data = res.data?.data?.attendance || res.data?.data || res.data;
      return mapBackendAttendance(data);
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || `Failed to fetch attendance record for ID ${id}.`;
      throw new Error(message);
    }
  },
};
