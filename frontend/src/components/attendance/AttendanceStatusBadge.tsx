import React from 'react';
import type { AttendanceStatus } from '../../types/attendance.types';

interface AttendanceStatusBadgeProps {
  status?: AttendanceStatus | null;
}

export const AttendanceStatusBadge: React.FC<AttendanceStatusBadgeProps> = ({ status }) => {
  if (!status) {
    return (
      <span className="badge badge-neutral">
        <span className="badge-dot" />
        Not Checked In
      </span>
    );
  }

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
          label: status,
        };
    }
  };

  const { className, label } = getConfig();

  return (
    <span className={className}>
      <span className="badge-dot" />
      {label}
    </span>
  );
};
