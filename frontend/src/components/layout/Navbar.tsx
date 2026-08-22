import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  portalTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ portalTitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const isAdminOrHR = user.role === 'ADMIN' || user.role === 'HR';
  const homePath = isAdminOrHR ? '/admin' : '/employee';

  return (
    <header className="app-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
        {/* Brand */}
        <div
          onClick={() => navigate(homePath)}
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', flexShrink: 0 }}
        >
          <span className="nav-brand-badge">DAYFLOW</span>
          <span style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
            HRMS
          </span>
        </div>

        {portalTitle && (
          <span
            style={{
              padding: '2px 8px',
              backgroundColor: 'var(--color-bg-subtle)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xs)',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              flexShrink: 0,
            }}
          >
            {portalTitle}
          </span>
        )}

        {/* Quick Nav Links for Admin */}
        {isAdminOrHR && (
          <nav className="nav-links-scroll" style={{ display: 'flex', gap: 'var(--space-1)', alignItems: 'center', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '2px' }}>
            <button
              onClick={() => navigate('/admin')}
              className={`btn btn-sm ${location.pathname === '/admin' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: location.pathname === '/admin' ? undefined : 'none', flexShrink: 0 }}
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/admin/employees')}
              className={`btn btn-sm ${location.pathname.startsWith('/admin/employees') ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: location.pathname.startsWith('/admin/employees') ? undefined : 'none', flexShrink: 0 }}
            >
              Employees
            </button>
            <button
              onClick={() => navigate('/admin/attendance')}
              className={`btn btn-sm ${location.pathname === '/admin/attendance' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: location.pathname === '/admin/attendance' ? undefined : 'none', flexShrink: 0 }}
            >
              Attendance
            </button>
            <button
              onClick={() => navigate('/admin/time-off')}
              className={`btn btn-sm ${location.pathname === '/admin/time-off' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: location.pathname === '/admin/time-off' ? undefined : 'none', flexShrink: 0 }}
            >
              Time Off
            </button>
          </nav>
        )}

        {/* Quick Nav Links for Employee */}
        {!isAdminOrHR && (
          <nav className="nav-links-scroll" style={{ display: 'flex', gap: 'var(--space-1)', alignItems: 'center', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '2px' }}>
            <button
              onClick={() => navigate('/employee')}
              className={`btn btn-sm ${location.pathname === '/employee' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: location.pathname === '/employee' ? undefined : 'none', flexShrink: 0 }}
            >
              Overview
            </button>
            <button
              onClick={() => navigate('/employee/attendance')}
              className={`btn btn-sm ${location.pathname === '/employee/attendance' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: location.pathname === '/employee/attendance' ? undefined : 'none', flexShrink: 0 }}
            >
              Attendance
            </button>
            <button
              onClick={() => navigate('/employee/time-off')}
              className={`btn btn-sm ${location.pathname === '/employee/time-off' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: location.pathname === '/employee/time-off' ? undefined : 'none', flexShrink: 0 }}
            >
              Time Off
            </button>
            <button
              onClick={() => navigate('/employee/payroll')}
              className={`btn btn-sm ${location.pathname === '/employee/payroll' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: location.pathname === '/employee/payroll' ? undefined : 'none', flexShrink: 0 }}
            >
              Payroll
            </button>
            <button
              onClick={() => navigate('/employee/profile')}
              className={`btn btn-sm ${location.pathname === '/employee/profile' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: location.pathname === '/employee/profile' ? undefined : 'none', flexShrink: 0 }}
            >
              Profile
            </button>
          </nav>
        )}
      </div>

      <div className="nav-user-info" style={{ flexShrink: 0 }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }} className="nav-user-email">
          {user.email || user.loginId}
        </span>
        <span
          className={`badge ${isAdminOrHR ? 'badge-info' : 'badge-neutral'}`}
          style={{ textTransform: 'uppercase', fontSize: '10px' }}
        >
          {user.role}
        </span>
        <button
          onClick={logout}
          className="btn btn-secondary btn-sm"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
};

export default Navbar;
