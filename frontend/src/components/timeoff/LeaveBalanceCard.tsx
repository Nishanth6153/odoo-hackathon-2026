import React from 'react';
import type { LeaveBalances } from '../../types/timeoff.types';

interface LeaveBalanceCardProps {
  balances?: LeaveBalances | null;
  loading?: boolean;
}

export const LeaveBalanceCard: React.FC<LeaveBalanceCardProps> = ({ balances, loading }) => {
  const cards = [
    {
      title: 'Paid Time Off',
      value: balances?.paidTimeOff !== undefined ? `${balances.paidTimeOff} Days` : 'Pending API',
      color: '#0066cc',
      bg: '#e8f0fe',
    },
    {
      title: 'Sick Leave',
      value: balances?.sickLeave !== undefined ? `${balances.sickLeave} Days` : 'Pending API',
      color: '#137333',
      bg: '#e6f4ea',
    },
    {
      title: 'Unpaid Leave',
      value: balances?.unpaidLeave !== undefined ? `${balances.unpaidLeave} Days` : 'Pending API',
      color: '#b06000',
      bg: '#fef7e0',
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
      {cards.map((card, idx) => (
        <div
          key={idx}
          style={{
            padding: '1.25rem',
            borderRadius: '10px',
            backgroundColor: '#ffffff',
            border: '1px solid #e0e0e0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#555' }}>{card.title}</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: card.color }}>
            {loading ? 'Loading...' : card.value}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#888' }}>
            {balances ? 'Official Backend Balance' : 'Backend integration pending'}
          </span>
        </div>
      ))}
    </div>
  );
};
