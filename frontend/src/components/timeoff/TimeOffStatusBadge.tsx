import React from 'react';
import type { TimeOffStatus } from '../../types/timeoff.types';

interface TimeOffStatusBadgeProps {
  status: TimeOffStatus;
}

export const TimeOffStatusBadge: React.FC<TimeOffStatusBadgeProps> = ({ status }) => {
  const getConfig = () => {
    switch (status) {
      case 'PENDING':
        return {
          className: 'badge badge-warning',
          label: 'Pending Review',
        };
      case 'APPROVED':
        return {
          className: 'badge badge-success',
          label: 'Approved',
        };
      case 'REJECTED':
        return {
          className: 'badge badge-error',
          label: 'Rejected',
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
