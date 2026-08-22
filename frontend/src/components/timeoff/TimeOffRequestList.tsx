import React from 'react';
import { TimeOffStatusBadge } from './TimeOffStatusBadge';
import type { TimeOffRequest } from '../../types/timeoff.types';

interface TimeOffRequestListProps {
  requests: TimeOffRequest[];
  showEmployeeInfo?: boolean;
  onSelectRequest?: (request: TimeOffRequest) => void;
}

export const TimeOffRequestList: React.FC<TimeOffRequestListProps> = ({
  requests,
  showEmployeeInfo = false,
  onSelectRequest,
}) => {
  const formatLeaveType = (type: string) => {
    switch (type) {
      case 'PAID_TIME_OFF':
        return 'Paid Time Off';
      case 'SICK_LEAVE':
        return 'Sick Leave';
      case 'UNPAID_LEAVE':
        return 'Unpaid Leave';
      default:
        return type;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const calculateDays = (req: TimeOffRequest) => {
    if (req.numberOfDays !== undefined && req.numberOfDays !== null) return req.numberOfDays;
    if (req.days !== undefined && req.days !== null) return req.days;

    try {
      const start = new Date(req.startDate);
      const end = new Date(req.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return isNaN(diffDays) ? '—' : diffDays;
    } catch {
      return '—';
    }
  };

  if (!requests || requests.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🌴</div>
        <div className="empty-state-title">No Leave Requests</div>
        <p className="empty-state-desc">There are no leave requests recorded for this selection.</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {showEmployeeInfo && <th>Employee</th>}
            <th>Type</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Days</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req.id}>
              {showEmployeeInfo && (
                <td>
                  <div style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{req.employeeName || 'Employee'}</div>
                  {req.employeeEmail && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{req.employeeEmail}</div>}
                </td>
              )}
              <td style={{ fontWeight: 500 }}>{formatLeaveType(req.type)}</td>
              <td style={{ color: 'var(--color-text-secondary)' }}>{formatDate(req.startDate)}</td>
              <td style={{ color: 'var(--color-text-secondary)' }}>{formatDate(req.endDate)}</td>
              <td style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{calculateDays(req)}</td>
              <td style={{ color: 'var(--color-text-muted)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {req.reason}
              </td>
              <td>
                <TimeOffStatusBadge status={req.status} />
              </td>
              <td>
                <button
                  onClick={() => onSelectRequest?.(req)}
                  className="btn btn-outline btn-sm"
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TimeOffRequestList;
