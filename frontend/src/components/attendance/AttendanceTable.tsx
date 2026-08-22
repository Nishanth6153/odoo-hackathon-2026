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
      <div style={{ padding: '2.5rem', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '8px', color: '#777' }}>
        No attendance records found.
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#ffffff' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f7fa', borderBottom: '1px solid #e0e0e0' }}>
            <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#444' }}>Date</th>
            {showEmployeeInfo && <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#444' }}>Employee</th>}
            {showEmployeeInfo && <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#444' }}>Dept</th>}
            <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#444' }}>Status</th>
            <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#444' }}>Check In</th>
            <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#444' }}>Check Out</th>
            <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#444' }}>Work Duration</th>
            <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#444' }}>Extra Hours</th>
          </tr>
        </thead>
        <tbody>
          {records.map((rec) => (
            <tr key={rec.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '0.85rem 1rem', fontWeight: 500, color: '#222' }}>{formatDate(rec.date)}</td>
              {showEmployeeInfo && (
                <td style={{ padding: '0.85rem 1rem', color: '#222' }}>
                  <div style={{ fontWeight: 500 }}>{rec.employeeName || 'Unknown'}</div>
                  {rec.employeeEmail && <div style={{ fontSize: '0.8rem', color: '#666' }}>{rec.employeeEmail}</div>}
                </td>
              )}
              {showEmployeeInfo && <td style={{ padding: '0.85rem 1rem', color: '#555' }}>{rec.department || '—'}</td>}
              <td style={{ padding: '0.85rem 1rem' }}>
                <AttendanceStatusBadge status={rec.status} />
              </td>
              <td style={{ padding: '0.85rem 1rem', color: '#333' }}>{formatTime(rec.checkIn)}</td>
              <td style={{ padding: '0.85rem 1rem', color: '#333' }}>{formatTime(rec.checkOut)}</td>
              <td style={{ padding: '0.85rem 1rem', color: '#333', fontWeight: 500 }}>{formatMinutes(rec.workMinutes)}</td>
              <td style={{ padding: '0.85rem 1rem', color: rec.extraMinutes ? '#137333' : '#777' }}>
                {formatMinutes(rec.extraMinutes)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
