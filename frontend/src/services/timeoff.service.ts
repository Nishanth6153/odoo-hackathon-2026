import apiClient from '../api/client';
import type { CreateTimeOffData, LeaveBalances, TimeOffRequest } from '../types/timeoff.types';

const mapBackendTimeOff = (item: any): TimeOffRequest => {
  const emp = item?.employee || {};
  const rawType = item?.leaveType || item?.type || 'PAID';
  const mappedType =
    rawType === 'PAID'
      ? 'PAID_TIME_OFF'
      : rawType === 'SICK'
      ? 'SICK_LEAVE'
      : rawType === 'UNPAID'
      ? 'UNPAID_LEAVE'
      : rawType;

  return {
    id: item?.id || '',
    employeeId: emp?.employeeId || item?.employeeId || '',
    employeeName: emp?.name || item?.employeeName || 'Staff Member',
    employeeEmail: emp?.user?.email || item?.employeeEmail || '',
    department: emp?.jobTitle || 'Engineering',
    type: mappedType as any,
    startDate: item?.startDate || '',
    endDate: item?.endDate || '',
    days: typeof item?.days === 'number' ? item.days : undefined,
    numberOfDays: typeof item?.days === 'number' ? item.days : undefined,
    reason: item?.remarks || item?.reason || '',
    status: item?.status || 'PENDING',
    createdAt: item?.createdAt,
    updatedAt: item?.updatedAt,
  };
};

export const timeOffService = {
  async createTimeOffRequest(data: CreateTimeOffData): Promise<TimeOffRequest> {
    try {
      const rawType = data.type;
      const leaveType =
        rawType === 'PAID_TIME_OFF'
          ? 'PAID'
          : rawType === 'SICK_LEAVE'
          ? 'SICK'
          : rawType === 'UNPAID_LEAVE'
          ? 'UNPAID'
          : rawType;

      const payload = {
        leaveType,
        startDate: data.startDate,
        endDate: data.endDate,
        remarks: data.reason || undefined,
      };

      const res = await apiClient.post('/timeoff', payload);
      const resData = res.data?.data?.request || res.data?.data || res.data;
      return mapBackendTimeOff(resData);
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Failed to submit time-off request.';
      throw new Error(message);
    }
  },

  async getMyTimeOffRequests(): Promise<TimeOffRequest[]> {
    try {
      const res = await apiClient.get('/timeoff/me');
      const resData = res.data?.data || res.data;
      const list = Array.isArray(resData?.requests) ? resData.requests : Array.isArray(resData) ? resData : [];
      return list.map(mapBackendTimeOff);
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Failed to fetch your time-off requests.';
      throw new Error(message);
    }
  },

  async getTimeOffRequests(): Promise<TimeOffRequest[]> {
    try {
      const res = await apiClient.get('/timeoff');
      const resData = res.data?.data || res.data;
      const list = Array.isArray(resData?.requests) ? resData.requests : Array.isArray(resData) ? resData : [];
      return list.map(mapBackendTimeOff);
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Failed to fetch time-off requests.';
      throw new Error(message);
    }
  },

  async getTimeOffRequestById(id: string): Promise<TimeOffRequest> {
    try {
      const res = await apiClient.get(`/timeoff/${id}`);
      const resData = res.data?.data?.request || res.data?.data || res.data;
      return mapBackendTimeOff(resData);
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || `Failed to fetch request details for ID ${id}.`;
      throw new Error(message);
    }
  },

  async approveTimeOffRequest(id: string, adminComment?: string): Promise<TimeOffRequest> {
    try {
      const res = await apiClient.patch(`/timeoff/${id}/approve`, {
        adminComment: adminComment || undefined,
      });
      const resData = res.data?.data?.request || res.data?.data || res.data;
      return mapBackendTimeOff(resData);
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Failed to approve request.';
      throw new Error(message);
    }
  },

  async rejectTimeOffRequest(id: string, adminComment?: string): Promise<TimeOffRequest> {
    try {
      const res = await apiClient.patch(`/timeoff/${id}/reject`, {
        adminComment: adminComment || undefined,
      });
      const resData = res.data?.data?.request || res.data?.data || res.data;
      return mapBackendTimeOff(resData);
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Failed to reject request.';
      throw new Error(message);
    }
  },

  async getLeaveBalances(): Promise<LeaveBalances | null> {
    try {
      const requests = await this.getMyTimeOffRequests();
      const approvedPaid = requests
        .filter((r) => r.type === 'PAID_TIME_OFF' && r.status === 'APPROVED')
        .reduce((sum, r) => sum + (r.days || 1), 0);
      const approvedSick = requests
        .filter((r) => r.type === 'SICK_LEAVE' && r.status === 'APPROVED')
        .reduce((sum, r) => sum + (r.days || 1), 0);

      return {
        paidTimeOff: Math.max(0, 15 - approvedPaid),
        sickLeave: Math.max(0, 10 - approvedSick),
        unpaidLeave: 0,
      };
    } catch {
      return {
        paidTimeOff: 15,
        sickLeave: 10,
        unpaidLeave: 0,
      };
    }
  },
};
