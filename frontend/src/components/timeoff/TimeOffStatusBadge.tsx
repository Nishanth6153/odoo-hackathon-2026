import React from 'react';
import type { TimeOffStatus } from '../../types/timeoff.types';

interface TimeOffStatusBadgeProps {
  status: TimeOffStatus;
}

export const TimeOffStatusBadge: React.FC<TimeOffStatusBadgeProps> = ({ status }) => {
  const getStyle = () => {
    switch (status) {
      case 'PENDING':
        return {
          bg: '#fef7e0',
          color: '#b06000',
          label: '⏳ Pending',
        };
      case 'APPROVED':
        return {
          bg: '#e6f4ea',
          color: '#137333',
          label: '✅ Approved',
        };
      case 'REJECTED':
        return {
          bg: '#fce8e6',
          color: '#c5221f',
          label: '❌ Rejected',
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
