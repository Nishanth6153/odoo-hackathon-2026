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
      style={{
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '1.25rem',
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        cursor: 'pointer',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {employee.profileImage ? (
          <img
            src={employee.profileImage}
            alt={employee.name}
            style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#0066cc',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '1.1rem',
            }}
          >
            {getInitials(employee.name || 'User')}
          </div>
        )}

        <div style={{ flex: 1, overflow: 'hidden' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {employee.name}
          </h3>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.875rem', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {employee.designation || 'No Designation'}
          </p>
        </div>

        <span
          style={{
            fontSize: '0.75rem',
            padding: '0.25rem 0.5rem',
            borderRadius: '12px',
            fontWeight: '600',
            backgroundColor: isActive ? '#e6f4ea' : '#feefe3',
            color: isActive ? '#137333' : '#b06000',
          }}
        >
          {employee.status || 'ACTIVE'}
        </span>
      </div>

      <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '0.75rem', fontSize: '0.85rem', color: '#555', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <div>
          <strong>Dept:</strong> {employee.department || 'N/A'}
        </div>
        <div>
          <strong>Email:</strong> {employee.email}
        </div>
        {employee.loginId && (
          <div>
            <strong>Login ID:</strong> {employee.loginId}
          </div>
        )}
      </div>
    </div>
  );
};
