import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { dashboardService } from '../services/dashboard.service';
import type { AdminDashboardData } from '../types/dashboard.types';

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getAdminDashboard();
      setMetrics(data);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Compute workforce segments from real data
  const totalEmployees = metrics?.employees.total || 0;
  const presentToday = metrics?.attendance.presentToday || 0;
  const onLeaveToday = metrics?.attendance.onLeaveToday || 0;
  const absentOrPending = Math.max(0, totalEmployees - presentToday - onLeaveToday);

  const presentPercent = totalEmployees > 0 ? (presentToday / totalEmployees) * 100 : 0;
  const leavePercent = totalEmployees > 0 ? (onLeaveToday / totalEmployees) * 100 : 0;
  const absentPercent = totalEmployees > 0 ? (absentOrPending / totalEmployees) * 100 : 0;

  return (
    <>
      <Navbar portalTitle="Administration" />

      <main className="page-container">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-title-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <h1>Admin Dashboard</h1>
              <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 9px' }}>
                <span className="badge-pulse" />
                LIVE FEED
              </span>
            </div>
            <p>
              Workforce statistics, attendance records, and organizational controls
              {lastUpdated && <span style={{ marginLeft: 'var(--space-2)', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>[synced {lastUpdated}]</span>}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
            <button
              onClick={fetchDashboard}
              disabled={loading}
              className="btn btn-primary btn-sm"
            >
              {loading ? 'Syncing...' : '↻ Refresh Data'}
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="alert alert-error" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>⚠️ {error}</span>
            <button onClick={fetchDashboard} className="btn btn-sm btn-danger">
              Retry
            </button>
          </div>
        )}

        {/* SECTION 1: DIVIDED STATS CONTAINER (Signature Reference Architecture) */}
        <section style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)' }}>
              Organization Metrics
            </h2>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              DAILY SNAPSHOT
            </span>
          </div>

          {loading ? (
            <div className="stat-grid-container">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="stat-grid-cell">
                  <div className="skeleton skeleton-text" style={{ width: '45%' }} />
                  <div className="skeleton skeleton-stat" style={{ width: '70%' }} />
                  <div className="skeleton skeleton-text" style={{ width: '60%' }} />
                </div>
              ))}
            </div>
          ) : metrics ? (
            <div className="stat-grid-container">
              {/* Total Employees */}
              <div
                className="stat-grid-cell"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/admin/employees')}
              >
                <span className="stat-label">Total Employees</span>
                <div className="stat-value">
                  {metrics.employees.total}
                </div>
                <span className="stat-subtext">Active staff members →</span>
              </div>

              {/* Attendance Today */}
              <div
                className="stat-grid-cell"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/admin/attendance')}
              >
                <span className="stat-label">Today's Present</span>
                <div className="stat-value">
                  {metrics.attendance.presentToday}
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text-muted)', marginLeft: '4px' }}>
                    / {totalEmployees}
                  </span>
                </div>
                <span className="stat-subtext">
                  Rate: <strong>{metrics.attendance.attendanceRate}%</strong> (Leave: {metrics.attendance.onLeaveToday})
                </span>
              </div>

              {/* Pending Leave */}
              <div
                className="stat-grid-cell"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/admin/time-off')}
              >
                <span className="stat-label">Pending Leaves</span>
                <div className="stat-value" style={{ color: metrics.leave.pending > 0 ? 'var(--color-warning)' : 'var(--color-text-primary)' }}>
                  {metrics.leave.pending}
                </div>
                <span className="stat-subtext">Awaiting HR decision →</span>
              </div>

              {/* Salary Payroll */}
              <div className="stat-grid-cell">
                <span className="stat-label">Monthly Payroll Net</span>
                <div className="stat-value" style={{ fontSize: 'var(--text-2xl)' }}>
                  ₹{metrics.salary.totalNetSalary.toLocaleString()}
                </div>
                <span className="stat-subtext">
                  {metrics.salary.employeesWithSalary} profiles configured
                </span>
              </div>
            </div>
          ) : null}
        </section>

        {/* SECTION 2: WORKFORCE VISUALIZATION PANEL */}
        {metrics && !loading && (
          <section style={{ marginBottom: 'var(--space-8)' }}>
            <div className="card card-padding" style={{ backgroundColor: 'var(--color-surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
                    Today's Workforce Status
                  </h3>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    Live distribution across {totalEmployees} active personnel
                  </p>
                </div>
                <span className="badge badge-neutral" style={{ fontFamily: 'var(--font-mono)' }}>
                  {metrics.attendance.attendanceRate}% Present
                </span>
              </div>

              {/* Multi-segment capacity bar */}
              <div className="workforce-bar" style={{ marginBottom: 'var(--space-4)' }}>
                <div
                  className="workforce-segment"
                  style={{ width: `${presentPercent}%`, backgroundColor: 'var(--color-lime)' }}
                  title={`Present: ${presentToday} (${presentPercent.toFixed(1)}%)`}
                />
                <div
                  className="workforce-segment"
                  style={{ width: `${leavePercent}%`, backgroundColor: '#93c5fd' }}
                  title={`On Leave: ${onLeaveToday} (${leavePercent.toFixed(1)}%)`}
                />
                <div
                  className="workforce-segment"
                  style={{ width: `${absentPercent}%`, backgroundColor: 'var(--color-bg-subtle)' }}
                  title={`Not Logged In: ${absentOrPending} (${absentPercent.toFixed(1)}%)`}
                />
              </div>

              {/* Status Legend Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'var(--color-lime)', border: '1px solid var(--color-border-dark)' }} />
                  <span style={{ color: 'var(--color-text-secondary)' }}>Present:</span>
                  <strong>{presentToday} ({presentPercent.toFixed(0)}%)</strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#93c5fd', border: '1px solid var(--color-border)' }} />
                  <span style={{ color: 'var(--color-text-secondary)' }}>On Leave:</span>
                  <strong>{onLeaveToday} ({leavePercent.toFixed(0)}%)</strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }} />
                  <span style={{ color: 'var(--color-text-secondary)' }}>Not In:</span>
                  <strong>{absentOrPending} ({absentPercent.toFixed(0)}%)</strong>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 3: MANAGEMENT MODULES */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)' }}>
              Management Modules
            </h2>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              CORE SYSTEMS
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--space-5)',
            }}
          >
            {/* Employees Module */}
            <div
              onClick={() => navigate('/admin/employees')}
              className="action-card"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  Directory
                </span>
                <span style={{ fontSize: 'var(--text-lg)' }}>→</span>
              </div>
              <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)' }}>
                Employee Records
              </h3>
              <p style={{ margin: 'var(--space-2) 0 0', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>
                Add new staff, inspect full profiles, configure departments, and manage salary compensation structures.
              </p>
            </div>

            {/* Attendance Module */}
            <div
              onClick={() => navigate('/admin/attendance')}
              className="action-card"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  Time Tracking
                </span>
                <span style={{ fontSize: 'var(--text-lg)' }}>→</span>
              </div>
              <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)' }}>
                Attendance Logs
              </h3>
              <p style={{ margin: 'var(--space-2) 0 0', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>
                Monitor organization-wide real-time check-ins, check-outs, work durations, and overtime records.
              </p>
            </div>

            {/* Time Off Module */}
            <div
              onClick={() => navigate('/admin/time-off')}
              className="action-card"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  Approvals
                </span>
                <span style={{ fontSize: 'var(--text-lg)' }}>→</span>
              </div>
              <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)' }}>
                Time Off & Leave
              </h3>
              <p style={{ margin: 'var(--space-2) 0 0', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>
                Review, approve, or reject employee leave applications with automatic attendance synchronization.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default AdminPage;
