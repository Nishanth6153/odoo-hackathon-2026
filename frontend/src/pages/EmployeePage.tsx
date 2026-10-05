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
      setSuccessMsg('Checked in successfully! Shift duration is now actively tracking.');
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
      setSuccessMsg('Checked out successfully! Workday recorded.');
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
            <p>Your personnel portal for attendance terminal, leave balance, and compensation details</p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
            <button
              onClick={fetchDashboard}
              disabled={loading}
              className="btn btn-secondary btn-sm"
            >
              ↻ Refresh
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

        {/* ATTENDANCE TERMINAL HERO BANNER */}
        <div
          className="card card-padding"
          style={{
            marginBottom: 'var(--space-8)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--space-4)',
            backgroundColor: isWorking ? 'var(--color-success-bg)' : 'var(--color-surface)',
            borderColor: isWorking ? 'var(--color-success-border)' : 'var(--color-border)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <h2 style={{ margin: 0, fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)' }}>
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
                  NOT CHECKED IN
                </span>
              )}
            </div>

            <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-1)', fontFamily: 'var(--font-mono)' }}>
              ID: {data?.profile?.employeeId || 'EMP...'} | ROLE: {data?.profile?.jobTitle || 'Staff'}
              {isWorking && todayAtt?.checkIn && (
                <span style={{ color: 'var(--color-success-text)', marginLeft: 'var(--space-2)', fontWeight: 700 }}>
                  [IN AT {formatTimestamp(todayAtt.checkIn)} // ELAPSED {formatElapsed(elapsedSeconds)}]
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
                className="btn btn-primary"
              >
                {actionLoading ? 'Recording...' : '⏱️ Check In For Today →'}
              </button>
            ) : isWorking ? (
              <button
                onClick={handleCheckOut}
                disabled={actionLoading || loading}
                className="btn btn-danger"
              >
                {actionLoading ? 'Recording...' : '🚪 Check Out →'}
              </button>
            ) : (
              <button
                onClick={() => navigate('/employee/attendance')}
                className="btn btn-secondary btn-sm"
              >
                View History →
              </button>
            )}
          </div>
        </div>

        {/* SECTION 1: DIVIDED STATS OVERVIEW */}
        <section style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)' }}>
              Personal Overview
            </h2>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              SUMMARY
            </span>
          </div>

          {loading ? (
            <div className="stat-grid-container">
              {[1, 2, 3].map((i) => (
                <div key={i} className="stat-grid-cell">
                  <div className="skeleton skeleton-text" style={{ width: '40%' }} />
                  <div className="skeleton skeleton-stat" style={{ width: '70%' }} />
                  <div className="skeleton skeleton-text" style={{ width: '50%' }} />
                </div>
              ))}
            </div>
          ) : data ? (
            <div className="stat-grid-container">
              {/* Today Status */}
              <div className="stat-grid-cell">
                <span className="stat-label">Shift Status</span>
                <div className="stat-value" style={{ fontSize: 'var(--text-2xl)' }}>
                  {isWorking ? 'In Shift' : isCompleted ? 'Completed' : 'Not Started'}
                </div>
                <span className="stat-subtext">
                  {todayAtt?.checkIn ? `Punched at ${formatTimestamp(todayAtt.checkIn)}` : 'No punch recorded today'}
                </span>
              </div>

              {/* Pending Leave */}
              <div className="stat-grid-cell" style={{ cursor: 'pointer' }} onClick={() => navigate('/employee/time-off')}>
                <span className="stat-label">Pending Leave</span>
                <div className="stat-value" style={{ color: data.timeOff.pending > 0 ? 'var(--color-warning)' : 'var(--color-text-primary)' }}>
                  {data.timeOff.pending}
                </div>
                <span className="stat-subtext">Awaiting HR approval →</span>
              </div>

              {/* Approved Leave */}
              <div className="stat-grid-cell" style={{ cursor: 'pointer' }} onClick={() => navigate('/employee/time-off')}>
                <span className="stat-label">Approved Time Off</span>
                <div className="stat-value">
                  {data.timeOff.approved}
                </div>
                <span className="stat-subtext">Approved leave history →</span>
              </div>
            </div>
          ) : null}
        </section>

        {/* SECTION 2: WORKSPACE MODULES */}
        <section style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)' }}>
              Quick Navigation
            </h2>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              PORTAL APPS
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 'var(--space-5)',
            }}
          >
            <div onClick={() => navigate('/employee/attendance')} className="action-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>LOGS</span>
                <span>→</span>
              </div>
              <h3 style={{ margin: 0, fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>My Attendance</h3>
              <p style={{ margin: 'var(--space-1) 0 0', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                Monthly check-in logs and punch duration records
              </p>
            </div>

            <div onClick={() => navigate('/employee/time-off')} className="action-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>VACATION</span>
                <span>→</span>
              </div>
              <h3 style={{ margin: 0, fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>Apply Time Off</h3>
              <p style={{ margin: 'var(--space-1) 0 0', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                Leave balance entitlements and request submission
              </p>
            </div>

            <div onClick={() => navigate('/employee/profile')} className="action-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>DETAILS</span>
                <span>→</span>
              </div>
              <h3 style={{ margin: 0, fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>My Profile</h3>
              <p style={{ margin: 'var(--space-1) 0 0', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                Personal info, department, and expertise tags
              </p>
            </div>

            <div onClick={() => navigate('/employee/payroll')} className="action-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>COMPENSATION</span>
                <span>→</span>
              </div>
              <h3 style={{ margin: 0, fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>My Payroll</h3>
              <p style={{ margin: 'var(--space-1) 0 0', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                Monthly base wage and dynamic salary components
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: RECENT RECORDS */}
        {data && !loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-6)' }}>
            {/* Recent Attendance */}
            <div className="card card-padding">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <h3 style={{ margin: 0, fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
                  Recent Attendance Records
                </h3>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  LAST 5 LOGS
                </span>
              </div>

              {data.attendance.recent.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>No recent attendance logs found.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {data.attendance.recent.slice(0, 5).map((att) => (
                    <div
                      key={att.id}
                      style={{
                        padding: 'var(--space-3) var(--space-4)',
                        backgroundColor: 'var(--color-surface-warm)',
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
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <h3 style={{ margin: 0, fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
                  Recent Leave Requests
                </h3>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  HISTORY
                </span>
              </div>

              {data.timeOff.recent.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>No recent leave requests found.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {data.timeOff.recent.slice(0, 5).map((req) => (
                    <div
                      key={req.id}
                      style={{
                        padding: 'var(--space-3) var(--space-4)',
                        backgroundColor: 'var(--color-surface-warm)',
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
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
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
        )}
      </main>
    </>
  );
};

export default EmployeePage;
