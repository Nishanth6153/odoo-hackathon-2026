import React from 'react';
import { useAuth } from '../context/AuthContext';

export const AdminPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user?.name}</p>
      <p>Role: {user?.role}</p>
      <button
        onClick={logout}
        style={{
          marginTop: '1rem',
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
  );
};

export default AdminPage;
