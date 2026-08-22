import React from 'react';
import type { AttendanceStatus } from '../../types/attendance.types';

interface AttendanceStatusBadgeProps {
  status?: AttendanceStatus | null;
}

export const AttendanceStatusBadge: React.FC<AttendanceStatusBadgeProps> = ({ status }) => {
  if (!status) {
    return (
      <span
        style={{
          display: 'inline-block',
          fontSize: '0.8rem',
          padding: '0.25rem 0.65rem',
          borderRadius: '12px',
          fontWeight: 600,
          backgroundColor: '#f0f0f0',
          color: '#666666',
        }}
      >
        Not Checked In
      </span>
    );
  }

  const getStyle = () => {
    switch (status) {
      case 'PRESENT':
        return {
          bg: '#e6f4ea',
          color: '#137333',
          label: 'Present / In Office',
        };
      case 'ON_LEAVE':
        return {
          bg: '#e8f0fe',
          color: '#1a73e8',
          label: 'On Leave',
        };
      case 'ABSENT':
        return {
          bg: '#fef7e0',
          color: '#b06000',
          label: 'Absent',
        };
      default:
        return {
          bg: '#f0f0f0',
          color: '#666666',
          label: status,
        };
    }
  };

  const { bg, color, label } = getStyle();

  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: '0.8rem',
        padding: '0.25rem 0.65rem',
        borderRadius: '12px',
        fontWeight: 600,
        backgroundColor: bg,
        color: color,
      }}
    >
      {label}
    </span>
  );
};
