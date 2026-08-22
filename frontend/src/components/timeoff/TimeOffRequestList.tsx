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
      <div style={{ padding: '2.5rem', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '8px', color: '#777' }}>
        No time-off requests found.
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#ffffff' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f7fa', borderBottom: '1px solid #e0e0e0' }}>
            {showEmployeeInfo && <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#444' }}>Employee</th>}
            <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#444' }}>Type</th>
            <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#444' }}>Start Date</th>
            <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#444' }}>End Date</th>
            <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#444' }}>Days</th>
            <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#444' }}>Reason</th>
            <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#444' }}>Status</th>
            <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#444' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
              {showEmployeeInfo && (
                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ fontWeight: 500, color: '#222' }}>{req.employeeName || 'Employee'}</div>
                  {req.employeeEmail && <div style={{ fontSize: '0.8rem', color: '#666' }}>{req.employeeEmail}</div>}
                </td>
              )}
              <td style={{ padding: '0.85rem 1rem', fontWeight: 500, color: '#333' }}>{formatLeaveType(req.type)}</td>
              <td style={{ padding: '0.85rem 1rem', color: '#555' }}>{formatDate(req.startDate)}</td>
              <td style={{ padding: '0.85rem 1rem', color: '#555' }}>{formatDate(req.endDate)}</td>
              <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#333' }}>{calculateDays(req)}</td>
              <td style={{ padding: '0.85rem 1rem', color: '#666', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {req.reason}
              </td>
              <td style={{ padding: '0.85rem 1rem' }}>
                <TimeOffStatusBadge status={req.status} />
              </td>
              <td style={{ padding: '0.85rem 1rem' }}>
                <button
                  onClick={() => onSelectRequest?.(req)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    backgroundColor: '#eef2f6',
                    border: '1px solid #0066cc',
                    color: '#0066cc',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                  }}
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
