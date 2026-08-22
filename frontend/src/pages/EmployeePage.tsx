import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/layout/Navbar';
import { dashboardService } from '../services/dashboard.service';
import { attendanceService } from '../services/attendance.service';
import type { EmployeeDashboardData } from '../types/dashboard.types';

export const EmployeePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<EmployeeDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Live timer for active working shift
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardService.getEmployeeDashboard();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load employee dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const todayAtt = data?.attendance?.today;
  const isWorking = Boolean(todayAtt?.checkIn && !todayAtt?.checkOut);
  const isCompleted = Boolean(todayAtt?.checkIn && todayAtt?.checkOut);

  // Setup ticking elapsed duration
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isWorking && todayAtt?.checkIn) {
      const checkInTime = new Date(todayAtt.checkIn).getTime();

      const updateTimer = () => {
        const now = Date.now();
        const diffInSeconds = Math.max(0, Math.floor((now - checkInTime) / 1000));
        setElapsedSeconds(diffInSeconds);
      };

      updateTimer();
      interval = setInterval(updateTimer, 1000);
    } else {
      setElapsedSeconds(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isWorking, todayAtt?.checkIn]);

  const formatElapsed = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  };

  const formatTimestamp = (timeStr?: string | null) => {
    if (!timeStr) return '—';
    try {
      const d = new Date(timeStr);
      if (isNaN(d.getTime())) return timeStr;
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return timeStr;
    }
  };

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      setError(null);
      setSuccessMsg(null);
      await attendanceService.checkIn();
      setSuccessMsg('Successfully checked in! Shift duration is now actively recording.');
      await fetchDashboard();
    } catch (err: any) {
      setError(err.message || 'Check-in failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      setError(null);
      setSuccessMsg(null);
      await attendanceService.checkOut();
      setSuccessMsg('Successfully checked out! Shift recorded and saved.');
      await fetchDashboard();
    } catch (err: any) {
      setError(err.message || 'Check-out failed.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <Navbar portalTitle="Employee Workspace" />

      <main className="page-container">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-title-group">
            <h1>Employee Workspace</h1>
            <p>Real-time attendance, leave entitlement balance, and payroll summary</p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
            <button
              onClick={fetchDashboard}
              disabled={loading}
              className="btn btn-secondary btn-sm"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="alert alert-error" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>⚠️ {error}</span>
            <button onClick={fetchDashboard} className="btn btn-sm btn-danger">
              Retry
            </button>
          </div>
        )}
        {successMsg && (
          <div className="alert alert-success">
            <span>✓ {successMsg}</span>
          </div>
        )}

        {/* SIGNATURE ATTENDANCE HERO BANNER */}
        <div
          className="card card-padding"
          style={{
            marginBottom: 'var(--space-6)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--space-4)',
            backgroundColor: isWorking ? 'var(--color-success-bg)' : undefined,
            borderColor: isWorking ? 'var(--color-success-border)' : undefined,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <h2 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)' }}>
                {data?.profile?.name || user?.name || 'Employee Member'}
              </h2>
              {isWorking ? (
                <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 8px' }}>
                  <span className="badge-pulse" />
                  YOU'RE WORKING
                </span>
              ) : isCompleted ? (
                <span className="badge badge-success" style={{ padding: '3px 8px' }}>
                  ✓ WORKDAY COMPLETE
                </span>
              ) : (
                <span className="badge badge-neutral" style={{ padding: '3px 8px' }}>
                  <span className="badge-dot" />
                  Not Checked In
                </span>
              )}
            </div>

            <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-1)' }}>
              ID: <strong style={{ fontFamily: 'var(--font-mono)' }}>{data?.profile?.employeeId || 'EMP...'}</strong> | Role: {data?.profile?.jobTitle || 'Staff'}
              {isWorking && todayAtt?.checkIn && (
                <span style={{ color: 'var(--color-success-text)', marginLeft: 'var(--space-2)', fontWeight: 600 }}>
                  • In at {formatTimestamp(todayAtt.checkIn)} (Elapsed: {formatElapsed(elapsedSeconds)})
                </span>
              )}
              {isCompleted && (
                <span style={{ color: 'var(--color-text-secondary)', marginLeft: 'var(--space-2)' }}>
                  • Total Worked: {todayAtt?.workMinutes ? `${Math.floor(todayAtt.workMinutes / 60)}h ${todayAtt.workMinutes % 60}m` : 'Completed'}
                </span>
              )}
            </div>
          </div>

          {/* Quick Check-In / Check-Out Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            {!todayAtt?.checkIn ? (
              <button
                onClick={handleCheckIn}
                disabled={actionLoading || loading}
                className="btn btn-success"
              >
                {actionLoading ? 'Checking In...' : '⏱️ Check In'}
              </button>
            ) : isWorking ? (
              <button
                onClick={handleCheckOut}
                disabled={actionLoading || loading}
                className="btn btn-danger"
              >
                {actionLoading ? 'Checking Out...' : '🚪 Check Out'}
              </button>
            ) : (
              <button
                onClick={() => navigate('/employee/attendance')}
                className="btn btn-secondary btn-sm"
              >
                View History
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 'var(--space-4)',
              marginBottom: 'var(--space-6)',
            }}
          >
            {[1, 2, 3].map((i) => (
              <div key={i} className="stat-card">
                <div className="skeleton skeleton-text" style={{ width: '40%' }} />
                <div className="skeleton skeleton-stat" />
                <div className="skeleton skeleton-text" style={{ width: '60%' }} />
              </div>
            ))}
          </div>
        ) : data ? (
          <>
            {/* Overview Summary Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 'var(--space-4)',
                marginBottom: 'var(--space-6)',
              }}
            >
              {/* Today Status */}
              <div className="stat-card">
                <span className="stat-label">Today's Attendance</span>
                <div className="stat-value" style={{ color: isWorking || isCompleted ? 'var(--color-success)' : 'var(--color-warning)', fontSize: 'var(--text-2xl)' }}>
                  {isWorking ? 'In Shift' : isCompleted ? 'Completed' : 'Not Checked In'}
                </div>
                <span className="stat-subtext">
                  {todayAtt?.checkIn ? `Punched at ${formatTimestamp(todayAtt.checkIn)}` : 'No punch recorded today'}
                </span>
              </div>

              {/* Pending Leave */}
              <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/employee/time-off')}>
                <span className="stat-label">Pending Leave Requests</span>
                <div className="stat-value" style={{ color: 'var(--color-warning)' }}>
                  {data.timeOff.pending}
                </div>
                <span className="stat-subtext">Awaiting HR approval</span>
              </div>

              {/* Approved Leave */}
              <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/employee/time-off')}>
                <span className="stat-label">Approved Leaves</span>
                <div className="stat-value" style={{ color: 'var(--color-primary)' }}>
                  {data.timeOff.approved}
                </div>
                <span className="stat-subtext">Scheduled time off</span>
              </div>
            </div>

            {/* Quick Action Navigation Modules */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 'var(--space-4)',
                marginBottom: 'var(--space-8)',
              }}
            >
              <div onClick={() => navigate('/employee/attendance')} className="action-card">
                <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>⏱️</div>
                <h3 style={{ margin: 0, fontSize: 'var(--text-base)', color: 'var(--color-success)' }}>My Attendance</h3>
                <p style={{ margin: 'var(--space-1) 0 0', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                  Monthly check-in history and punch duration logs
                </p>
              </div>

              <div onClick={() => navigate('/employee/time-off')} className="action-card">
                <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>🌴</div>
                <h3 style={{ margin: 0, fontSize: 'var(--text-base)', color: 'var(--color-warning)' }}>Apply Time Off</h3>
                <p style={{ margin: 'var(--space-1) 0 0', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                  Leave balance entitlements and request submission
                </p>
              </div>

              <div onClick={() => navigate('/employee/profile')} className="action-card">
                <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>👤</div>
                <h3 style={{ margin: 0, fontSize: 'var(--text-base)', color: 'var(--color-primary)' }}>My Profile</h3>
                <p style={{ margin: 'var(--space-1) 0 0', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                  Personal info, job details, and skill tags
                </p>
              </div>

              <div onClick={() => navigate('/employee/payroll')} className="action-card">
                <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>💰</div>
                <h3 style={{ margin: 0, fontSize: 'var(--text-base)', color: 'var(--color-purple)' }}>My Payroll</h3>
                <p style={{ margin: 'var(--space-1) 0 0', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                  Monthly wage and dynamic salary components
                </p>
              </div>
            </div>

            {/* Recent Logs Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-6)' }}>
              {/* Recent Attendance */}
              <div className="card card-padding">
                <h3 style={{ margin: '0 0 var(--space-4)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
                  Recent Attendance Records
                </h3>
                {data.attendance.recent.length === 0 ? (
                  <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>No recent attendance logs found.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {data.attendance.recent.slice(0, 5).map((att) => (
                      <div
                        key={att.id}
                        style={{
                          padding: 'var(--space-3)',
                          backgroundColor: 'var(--color-bg-subtle)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--color-border)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                            {new Date(att.date).toLocaleDateString()}
                          </strong>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                            {att.checkIn ? `In: ${formatTimestamp(att.checkIn)}` : ''}{' '}
                            {att.checkOut ? `| Out: ${formatTimestamp(att.checkOut)}` : ''}
                          </div>
                        </div>
                        <span className={`badge ${att.status === 'PRESENT' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: 'var(--text-xs)' }}>
                          <span className="badge-dot" />
                          {att.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Time Off */}
              <div className="card card-padding">
                <h3 style={{ margin: '0 0 var(--space-4)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
                  Recent Leave Requests
                </h3>
                {data.timeOff.recent.length === 0 ? (
                  <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>No recent leave requests found.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {data.timeOff.recent.slice(0, 5).map((req) => (
                      <div
                        key={req.id}
                        style={{
                          padding: 'var(--space-3)',
                          backgroundColor: 'var(--color-bg-subtle)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--color-border)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                            {req.leaveType} ({req.days} days)
                          </strong>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                            {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                          </div>
                        </div>
                        <span
                          className={`badge ${
                            req.status === 'APPROVED'
                              ? 'badge-success'
                              : req.status === 'REJECTED'
                              ? 'badge-error'
                              : 'badge-warning'
                          }`}
                          style={{ fontSize: 'var(--text-xs)' }}
                        >
                          <span className="badge-dot" />
                          {req.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : null}
      </main>
    </>
  );
};

export default EmployeePage;
