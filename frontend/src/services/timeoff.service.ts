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

    const request: TimeOffRequest = resData?.request || resData?.data || resData;
    return request;
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

    const requests: TimeOffRequest[] = Array.isArray(resData)
      ? resData
      : Array.isArray(resData?.requests)
      ? resData.requests
      : Array.isArray(resData?.data)
      ? resData.data
      : [];

    return requests;
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

    const requests: TimeOffRequest[] = Array.isArray(resData)
      ? resData
      : Array.isArray(resData?.requests)
      ? resData.requests
      : Array.isArray(resData?.data)
      ? resData.data
      : [];

    return requests;
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

    const request: TimeOffRequest = resData?.request || resData?.data || resData;
    return request;
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

    const request: TimeOffRequest = resData?.request || resData?.data || resData;
    return request;
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

    const request: TimeOffRequest = resData?.request || resData?.data || resData;
    return request;
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

      return resData?.balances || resData?.data || resData;
    } catch {
      return null;
    }
  },
};
