import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AdminPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Admin / HR Dashboard</h1>
        <button
          onClick={logout}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#dc3545',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ border: '1px solid #e0e0e0', padding: '1.5rem', borderRadius: '8px', backgroundColor: '#fff', marginBottom: '2rem' }}>
        <p><strong>Welcome,</strong> {user?.name}</p>
        <p><strong>Role:</strong> {user?.role}</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => navigate('/admin/employees')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#0066cc',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '1rem',
          }}
        >
          👥 Employees Directory
        </button>

        <button
          onClick={() => navigate('/admin/attendance')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#137333',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '1rem',
          }}
        >
          ⏱️ Attendance Management
        </button>

        <button
          onClick={() => navigate('/admin/time-off')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#b06000',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '1rem',
          }}
        >
          🌴 Time Off & Leave Requests
        </button>
      </div>
    </div>
  );
};

export default AdminPage;
