import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboard.service';
import type { AdminDashboardData } from '../types/dashboard.types';

export const AdminPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getAdminDashboard();
      setMetrics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, color: '#1a1f36' }}>Admin / HR Portal</h1>
          <p style={{ margin: '0.25rem 0 0 0', color: '#697386' }}>Dayflow Human Resource Management System</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={fetchDashboard}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#f4f5f7',
              color: '#3c4257',
              border: '1px solid #dcdfe4',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            🔄 Refresh
          </button>
          <button
            onClick={logout}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#e24d42',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* User Info Banner */}
      <div
        style={{
          border: '1px solid #e3e8ee',
          padding: '1.25rem 1.5rem',
          borderRadius: '8px',
          backgroundColor: '#fff',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <div>
          <span style={{ color: '#697386', fontSize: '0.9rem' }}>Logged in as: </span>
          <strong style={{ color: '#1a1f36' }}>{user?.email || user?.loginId}</strong>
        </div>
        <div>
          <span
            style={{
              backgroundColor: '#e6f4ea',
              color: '#137333',
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            Role: {user?.role}
          </span>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div
          style={{
            backgroundColor: '#fde8e8',
            color: '#c53030',
            padding: '1rem',
            borderRadius: '6px',
            marginBottom: '1.5rem',
          }}
        >
          {error}
        </div>
      )}

      {/* Dashboard Metrics Grid */}
      <h2 style={{ fontSize: '1.25rem', color: '#1a1f36', marginBottom: '1rem' }}>Overview & Analytics</h2>
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#697386' }}>Loading real-time analytics...</div>
      ) : metrics ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2rem',
          }}
        >
          {/* Total Employees */}
          <div
            style={{
              backgroundColor: '#fff',
              border: '1px solid #e3e8ee',
              borderRadius: '8px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ color: '#697386', fontSize: '0.875rem', fontWeight: 500 }}>Total Employees</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0066cc', marginTop: '0.5rem' }}>
              {metrics.employees.total}
            </div>
            <div style={{ color: '#697386', fontSize: '0.8rem', marginTop: '0.25rem' }}>Active staff members</div>
          </div>

          {/* Attendance Today */}
          <div
            style={{
              backgroundColor: '#fff',
              border: '1px solid #e3e8ee',
              borderRadius: '8px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ color: '#697386', fontSize: '0.875rem', fontWeight: 500 }}>Today's Attendance</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#137333', marginTop: '0.5rem' }}>
              {metrics.attendance.presentToday} <span style={{ fontSize: '1rem', fontWeight: 400 }}>Present</span>
            </div>
            <div style={{ color: '#697386', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              Rate: <strong>{metrics.attendance.attendanceRate}%</strong> | On Leave: {metrics.attendance.onLeaveToday}
            </div>
          </div>

          {/* Pending Leave */}
          <div
            style={{
              backgroundColor: '#fff',
              border: '1px solid #e3e8ee',
              borderRadius: '8px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ color: '#697386', fontSize: '0.875rem', fontWeight: 500 }}>Pending Leave Requests</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#b06000', marginTop: '0.5rem' }}>
              {metrics.leave.pending}
            </div>
            <div style={{ color: '#697386', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              Requires review & approval
            </div>
          </div>

          {/* Salary Expenditure */}
          <div
            style={{
              backgroundColor: '#fff',
              border: '1px solid #e3e8ee',
              borderRadius: '8px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ color: '#697386', fontSize: '0.875rem', fontWeight: 500 }}>Monthly Payroll Net</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#553c9a', marginTop: '0.5rem' }}>
              ₹{metrics.salary.totalNetSalary.toLocaleString()}
            </div>
            <div style={{ color: '#697386', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              {metrics.salary.employeesWithSalary} profiles configured
            </div>
          </div>
        </div>
      ) : null}

      {/* Navigation Quick Actions */}
      <h2 style={{ fontSize: '1.25rem', color: '#1a1f36', marginBottom: '1rem' }}>Management Modules</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        <div
          onClick={() => navigate('/admin/employees')}
          style={{
            backgroundColor: '#fff',
            border: '1px solid #e3e8ee',
            borderRadius: '8px',
            padding: '1.5rem',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
        >
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>👥</div>
          <h3 style={{ margin: '0 0 0.25rem 0', color: '#0066cc' }}>Employees Directory</h3>
          <p style={{ margin: 0, color: '#697386', fontSize: '0.875rem' }}>
            Add new employees, inspect profiles, and manage employee salary structures.
          </p>
        </div>

        <div
          onClick={() => navigate('/admin/attendance')}
          style={{
            backgroundColor: '#fff',
            border: '1px solid #e3e8ee',
            borderRadius: '8px',
            padding: '1.5rem',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
        >
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏱️</div>
          <h3 style={{ margin: '0 0 0.25rem 0', color: '#137333' }}>Attendance Logs</h3>
          <p style={{ margin: 0, color: '#697386', fontSize: '0.875rem' }}>
            Monitor real-time check-ins, check-outs, and employee work duration.
          </p>
        </div>

        <div
          onClick={() => navigate('/admin/time-off')}
          style={{
            backgroundColor: '#fff',
            border: '1px solid #e3e8ee',
            borderRadius: '8px',
            padding: '1.5rem',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
        >
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🌴</div>
          <h3 style={{ margin: '0 0 0.25rem 0', color: '#b06000' }}>Time Off Approvals</h3>
          <p style={{ margin: 0, color: '#697386', fontSize: '0.875rem' }}>
            Review, approve, or reject employee leave requests with attendance sync.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
