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
      value: balances?.paidTimeOff !== undefined ? `${balances.paidTimeOff} Days` : '15 Days',
      color: 'var(--color-primary)',
      subtext: 'Standard Annual Allowance',
    },
    {
      title: 'Sick Leave',
      value: balances?.sickLeave !== undefined ? `${balances.sickLeave} Days` : '10 Days',
      color: 'var(--color-success)',
      subtext: 'Medical & Health Leaves',
    },
    {
      title: 'Unpaid Leave',
      value: balances?.unpaidLeave !== undefined ? `${balances.unpaidLeave} Days` : '0 Days',
      color: 'var(--color-warning)',
      subtext: 'Discretionary Leaves',
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
      {cards.map((card, idx) => (
        <div key={idx} className="stat-card">
          <span className="stat-label">{card.title}</span>
          {loading ? (
            <div className="skeleton skeleton-stat" style={{ width: '50%' }} />
          ) : (
            <div className="stat-value" style={{ color: card.color }}>
              {card.value}
            </div>
          )}
          <span className="stat-subtext">{card.subtext}</span>
        </div>
      ))}
    </div>
  );
};

export default LeaveBalanceCard;
