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
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <h1>Admin / HR Dashboard</h1>
              <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px' }}>
                <span className="badge-pulse" />
                Live
              </span>
            </div>
            <p>
              Real-time analytics and workforce management overview
              {lastUpdated && <span style={{ marginLeft: 'var(--space-2)', color: 'var(--color-text-muted)' }}>• Updated at {lastUpdated}</span>}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
            <button
              onClick={fetchDashboard}
              disabled={loading}
              className="btn btn-secondary btn-sm"
            >
              🔄 {loading ? 'Refreshing...' : 'Refresh Data'}
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

        {/* Dashboard Metrics Grid */}
        <section style={{ marginBottom: 'var(--space-8)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)', color: 'var(--color-text-primary)' }}>
            Organization Overview
          </h2>

          {loading ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 'var(--space-4)',
              }}
            >
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="stat-card">
                  <div className="skeleton skeleton-text" style={{ width: '40%' }} />
                  <div className="skeleton skeleton-stat" />
                  <div className="skeleton skeleton-text" style={{ width: '60%' }} />
                </div>
              ))}
            </div>
          ) : metrics ? (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: 'var(--space-4)',
                  marginBottom: 'var(--space-6)',
                }}
              >
                {/* Total Employees */}
                <div className="stat-card card-hover" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/employees')}>
                  <span className="stat-label">Total Employees</span>
                  <div className="stat-value" style={{ color: 'var(--color-primary)' }}>
                    {metrics.employees.total}
                  </div>
                  <span className="stat-subtext">Active staff members</span>
                </div>

                {/* Attendance Today */}
                <div className="stat-card card-hover" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/attendance')}>
                  <span className="stat-label">Today's Attendance</span>
                  <div className="stat-value" style={{ color: 'var(--color-success)' }}>
                    {metrics.attendance.presentToday} <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'normal', color: 'var(--color-text-muted)' }}>Present</span>
                  </div>
                  <span className="stat-subtext">
                    Rate: <strong>{metrics.attendance.attendanceRate}%</strong> | On Leave: {metrics.attendance.onLeaveToday}
                  </span>
                </div>

                {/* Pending Leave */}
                <div className="stat-card card-hover" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/time-off')}>
                  <span className="stat-label">Pending Leave Requests</span>
                  <div className="stat-value" style={{ color: 'var(--color-warning)' }}>
                    {metrics.leave.pending}
                  </div>
                  <span className="stat-subtext">Requires HR review & decision</span>
                </div>

                {/* Salary Payroll */}
                <div className="stat-card card-hover">
                  <span className="stat-label">Monthly Payroll Net</span>
                  <div className="stat-value" style={{ color: 'var(--color-purple)' }}>
                    ₹{metrics.salary.totalNetSalary.toLocaleString()}
                  </div>
                  <span className="stat-subtext">
                    {metrics.salary.employeesWithSalary} employee profiles configured
                  </span>
                </div>
              </div>

              {/* Real Data: Today's Workforce Visualization */}
              <div className="card card-padding" style={{ marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
                      Today's Workforce Status
                    </h3>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      Real-time distribution across active staff members ({totalEmployees} total)
                    </p>
                  </div>
                  <span className="badge badge-neutral" style={{ fontFamily: 'var(--font-mono)' }}>
                    {metrics.attendance.attendanceRate}% Attendance Rate
                  </span>
                </div>

                {/* Multi-segment capacity bar */}
                <div className="workforce-bar" style={{ marginBottom: 'var(--space-4)' }}>
                  <div
                    className="workforce-segment"
                    style={{ width: `${presentPercent}%`, backgroundColor: 'var(--color-success)' }}
                    title={`Present: ${presentToday} (${presentPercent.toFixed(1)}%)`}
                  />
                  <div
                    className="workforce-segment"
                    style={{ width: `${leavePercent}%`, backgroundColor: 'var(--color-info)' }}
                    title={`On Leave: ${onLeaveToday} (${leavePercent.toFixed(1)}%)`}
                  />
                  <div
                    className="workforce-segment"
                    style={{ width: `${absentPercent}%`, backgroundColor: 'var(--color-border)' }}
                    title={`Not Logged In: ${absentOrPending} (${absentPercent.toFixed(1)}%)`}
                  />
                </div>

                {/* Status Legend Pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', fontSize: 'var(--text-xs)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }} />
                    <span style={{ color: 'var(--color-text-secondary)' }}>Present:</span>
                    <strong>{presentToday} ({presentPercent.toFixed(0)}%)</strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-info)' }} />
                    <span style={{ color: 'var(--color-text-secondary)' }}>On Leave:</span>
                    <strong>{onLeaveToday} ({leavePercent.toFixed(0)}%)</strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-border)' }} />
                    <span style={{ color: 'var(--color-text-secondary)' }}>Not Logged In:</span>
                    <strong>{absentOrPending} ({absentPercent.toFixed(0)}%)</strong>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </section>

        {/* Management Modules */}
        <section>
          <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)', color: 'var(--color-text-primary)' }}>
            Management Modules
          </h2>

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
              <div style={{ fontSize: '1.75rem', marginBottom: 'var(--space-3)' }}>👥</div>
              <h3 style={{ margin: 0, color: 'var(--color-primary)', fontSize: 'var(--text-base)' }}>
                Employees Directory
              </h3>
              <p style={{ margin: 'var(--space-2) 0 0', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>
                Add new employees, inspect profiles, configure departments, and manage salary compensation structures.
              </p>
            </div>

            {/* Attendance Module */}
            <div
              onClick={() => navigate('/admin/attendance')}
              className="action-card"
            >
              <div style={{ fontSize: '1.75rem', marginBottom: 'var(--space-3)' }}>⏱️</div>
              <h3 style={{ margin: 0, color: 'var(--color-success)', fontSize: 'var(--text-base)' }}>
                Attendance Logs
              </h3>
              <p style={{ margin: 'var(--space-2) 0 0', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>
                Monitor organization-wide real-time check-ins, check-outs, work durations, and extra overtime hours.
              </p>
            </div>

            {/* Time Off Module */}
            <div
              onClick={() => navigate('/admin/time-off')}
              className="action-card"
            >
              <div style={{ fontSize: '1.75rem', marginBottom: 'var(--space-3)' }}>🌴</div>
              <h3 style={{ margin: 0, color: 'var(--color-warning)', fontSize: 'var(--text-base)' }}>
                Time Off Approvals
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
