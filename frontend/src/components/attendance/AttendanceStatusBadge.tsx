import React from 'react';
import type { AttendanceStatus } from '../../types/attendance.types';

interface AttendanceStatusBadgeProps {
  status?: AttendanceStatus | null;
}

export const AttendanceStatusBadge: React.FC<AttendanceStatusBadgeProps> = ({ status }) => {
  if (!status) {
    return (
<<<<<<< HEAD
      <span className="badge badge-neutral">
        <span className="badge-dot" />
=======
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
>>>>>>> origin/main
        Not Checked In
      </span>
    );
  }

<<<<<<< HEAD
  const getConfig = () => {
    switch (status) {
      case 'PRESENT':
        return {
          className: 'badge badge-success',
          label: 'Present',
        };
      case 'ABSENT':
        return {
          className: 'badge badge-error',
          label: 'Absent',
        };
      case 'HALF_DAY':
        return {
          className: 'badge badge-warning',
          label: 'Half Day',
        };
      case 'ON_LEAVE':
      case 'LEAVE' as any:
        return {
          className: 'badge badge-info',
          label: 'On Leave',
        };
      default:
        return {
          className: 'badge badge-neutral',
=======
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
>>>>>>> origin/main
          label: status,
        };
    }
  };

<<<<<<< HEAD
  const { className, label } = getConfig();

  return (
    <span className={className}>
      <span className="badge-dot" />
=======
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
>>>>>>> origin/main
      {label}
    </span>
  );
};
