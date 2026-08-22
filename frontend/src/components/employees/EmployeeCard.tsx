import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Employee } from '../../types/employee.types';

interface EmployeeCardProps {
  employee: Employee;
  onClick?: () => void;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/admin/employees/${employee.id}`);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isActive = employee.status === 'ACTIVE';

  return (
    <div
      onClick={handleClick}
      className="action-card"
      style={{ gap: 'var(--space-3)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {employee.profileImage ? (
          <img
            src={employee.profileImage}
            alt={employee.name}
            style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-full)', objectFit: 'cover', border: '1px solid var(--color-border)' }}
          />
        ) : (
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              border: '1px solid var(--color-primary-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 'var(--text-sm)',
            }}
          >
            {getInitials(employee.name || 'User')}
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {employee.name}
          </h3>
          <p style={{ margin: '2px 0 0', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {employee.designation || 'Staff'}
          </p>
        </div>

        <span className={`badge ${isActive ? 'badge-success' : 'badge-neutral'}`}>
          <span className="badge-dot" />
          {employee.status || 'ACTIVE'}
        </span>
      </div>

      <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--color-text-muted)' }}>Department</span>
          <strong>{employee.department || '—'}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', overflow: 'hidden' }}>
          <span style={{ color: 'var(--color-text-muted)' }}>Email</span>
          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '170px' }}>{employee.email}</span>
        </div>
        {employee.loginId && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>ID</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{employee.loginId}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeCard;
