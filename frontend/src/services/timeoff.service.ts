import type {
  CreateTimeOffData,
  LeaveBalances,
  TimeOffRequest,
} from '../types/timeoff.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const normalizeTimeOff = (raw: Record<string, unknown>): TimeOffRequest => {
  const item = raw || {};
  const emp = (item.employee || item.user || {}) as Record<string, unknown>;

  return {
    id: String(item.id || item._id || ''),
    employeeId: String(item.employeeId || item.employee_id || item.userId || item.user_id || emp.id || ''),
    employeeName: String(item.employeeName || item.employee_name || emp.name || item.name || ''),
    employeeEmail: String(item.employeeEmail || item.employee_email || emp.email || item.email || ''),
    department: String(item.department || emp.department || ''),
    type: (item.type as TimeOffRequest['type']) || 'PAID_TIME_OFF',
    startDate: String(item.startDate || item.start_date || ''),
    endDate: String(item.endDate || item.end_date || ''),
    days: typeof item.days === 'number' ? item.days : typeof item.numberOfDays === 'number' ? item.numberOfDays : typeof item.number_of_days === 'number' ? item.number_of_days : undefined,
    numberOfDays: typeof item.numberOfDays === 'number' ? item.numberOfDays : typeof item.number_of_days === 'number' ? item.number_of_days : typeof item.days === 'number' ? item.days : undefined,
    reason: String(item.reason || ''),
    attachmentUrl: (item.attachmentUrl || item.attachment_url || null) as string | null,
    status: (item.status as TimeOffRequest['status']) || 'PENDING',
    createdAt: (item.createdAt || item.created_at) as string | undefined,
    updatedAt: (item.updatedAt || item.updated_at) as string | undefined,
    approvedAt: (item.approvedAt || item.approved_at || null) as string | null,
    rejectedAt: (item.rejectedAt || item.rejected_at || null) as string | null,
  };
};

export const timeOffService = {
  async createTimeOffRequest(data: CreateTimeOffData): Promise<TimeOffRequest> {
    const res = await fetch(`${API_URL}/api/timeoff`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    const resData = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMessage = resData?.message || resData?.error || 'Failed to submit time-off request.';
      throw new Error(errorMessage);
    }

    const rawRecord = (resData?.request || resData?.data || resData) as Record<string, unknown>;
    return normalizeTimeOff(rawRecord);
  },

  async getMyTimeOffRequests(): Promise<TimeOffRequest[]> {
    const res = await fetch(`${API_URL}/api/timeoff/me`, {
      method: 'GET',
      headers: getHeaders(),
    });

    const resData = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMessage = resData?.message || resData?.error || 'Failed to fetch your time-off requests.';
      throw new Error(errorMessage);
    }

    const rawRecords = Array.isArray(resData)
      ? resData
      : Array.isArray(resData?.requests)
      ? resData.requests
      : Array.isArray(resData?.data)
      ? resData.data
      : [];

    return rawRecords.map(normalizeTimeOff);
  },

  async getTimeOffRequests(): Promise<TimeOffRequest[]> {
    const res = await fetch(`${API_URL}/api/timeoff`, {
      method: 'GET',
      headers: getHeaders(),
    });

    const resData = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMessage = resData?.message || resData?.error || 'Failed to fetch time-off requests.';
      throw new Error(errorMessage);
    }

    const rawRecords = Array.isArray(resData)
      ? resData
      : Array.isArray(resData?.requests)
      ? resData.requests
      : Array.isArray(resData?.data)
      ? resData.data
      : [];

    return rawRecords.map(normalizeTimeOff);
  },

  async getTimeOffRequestById(id: string): Promise<TimeOffRequest> {
    const res = await fetch(`${API_URL}/api/timeoff/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    const resData = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMessage = resData?.message || resData?.error || `Failed to fetch request details for ID ${id}.`;
      throw new Error(errorMessage);
    }

    const rawRecord = (resData?.request || resData?.data || resData) as Record<string, unknown>;
    return normalizeTimeOff(rawRecord);
  },

  async approveTimeOffRequest(id: string): Promise<TimeOffRequest> {
    const res = await fetch(`${API_URL}/api/timeoff/${id}/approve`, {
      method: 'PATCH',
      headers: getHeaders(),
    });

    const resData = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMessage = resData?.message || resData?.error || 'Failed to approve request.';
      throw new Error(errorMessage);
    }

    const rawRecord = (resData?.request || resData?.data || resData) as Record<string, unknown>;
    return normalizeTimeOff(rawRecord);
  },

  async rejectTimeOffRequest(id: string): Promise<TimeOffRequest> {
    const res = await fetch(`${API_URL}/api/timeoff/${id}/reject`, {
      method: 'PATCH',
      headers: getHeaders(),
    });

    const resData = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMessage = resData?.message || resData?.error || 'Failed to reject request.';
      throw new Error(errorMessage);
    }

    const rawRecord = (resData?.request || resData?.data || resData) as Record<string, unknown>;
    return normalizeTimeOff(rawRecord);
  },

  async getLeaveBalances(): Promise<LeaveBalances | null> {
    try {
      const res = await fetch(`${API_URL}/api/timeoff/me/balances`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!res.ok) return null;

      const resData = await res.json().catch(() => null);
      if (!resData) return null;

      const raw = (resData?.balances || resData?.data || resData) as Record<string, unknown>;
      return {
        paidTimeOff: typeof raw.paidTimeOff === 'number' ? raw.paidTimeOff : typeof raw.paid_time_off === 'number' ? raw.paid_time_off : undefined,
        sickLeave: typeof raw.sickLeave === 'number' ? raw.sickLeave : typeof raw.sick_leave === 'number' ? raw.sick_leave : undefined,
        unpaidLeave: typeof raw.unpaidLeave === 'number' ? raw.unpaidLeave : typeof raw.unpaid_leave === 'number' ? raw.unpaid_leave : undefined,
      };
    } catch {
      return null;
    }
  },
};
