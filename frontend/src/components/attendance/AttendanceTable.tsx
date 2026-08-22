import React from 'react';
import { AttendanceStatusBadge } from './AttendanceStatusBadge';
import type { AttendanceRecord } from '../../types/attendance.types';

interface AttendanceTableProps {
  records: AttendanceRecord[];
  showEmployeeInfo?: boolean;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({ records, showEmployeeInfo = false }) => {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short' });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return '—';
    try {
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) return timeStr;
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeStr;
    }
  };

  const formatMinutes = (mins: number | null | undefined) => {
    if (mins === null || mins === undefined) return '—';
    const hours = Math.floor(mins / 60);
    const remainder = mins % 60;
    return `${hours}h ${remainder}m`;
  };

  if (!records || records.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📋</div>
        <div className="empty-state-title">No Attendance Records</div>
        <p className="empty-state-desc">There are no attendance records matching the current criteria.</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Date</th>
            {showEmployeeInfo && <th>Employee</th>}
            {showEmployeeInfo && <th>Department</th>}
            <th>Status</th>
            <th>Check In</th>
            <th>Check Out</th>
            <th>Work Duration</th>
            <th>Extra Hours</th>
          </tr>
        </thead>
        <tbody>
          {records.map((rec) => (
            <tr key={rec.id}>
              <td style={{ fontWeight: 500 }}>{formatDate(rec.date)}</td>
              {showEmployeeInfo && (
                <td>
                  <div style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{rec.employeeName || 'Unknown'}</div>
                  {rec.employeeEmail && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{rec.employeeEmail}</div>}
                </td>
              )}
              {showEmployeeInfo && <td style={{ color: 'var(--color-text-secondary)' }}>{rec.department || '—'}</td>}
              <td>
                <AttendanceStatusBadge status={rec.status} />
              </td>
              <td style={{ color: 'var(--color-text-secondary)' }}>{formatTime(rec.checkIn)}</td>
              <td style={{ color: 'var(--color-text-secondary)' }}>{formatTime(rec.checkOut)}</td>
              <td style={{ fontWeight: 500 }}>{formatMinutes(rec.workMinutes)}</td>
              <td style={{ color: rec.extraMinutes ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                {formatMinutes(rec.extraMinutes)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceTable;
