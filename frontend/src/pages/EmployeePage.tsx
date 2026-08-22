import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboard.service';
import { attendanceService } from '../services/attendance.service';
import type { EmployeeDashboardData } from '../types/dashboard.types';

export const EmployeePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<EmployeeDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      setError(null);
      await attendanceService.checkIn();
      setSuccessMsg('Successfully checked in for today!');
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
      await attendanceService.checkOut();
      setSuccessMsg('Successfully checked out! Work duration recorded.');
      await fetchDashboard();
    } catch (err: any) {
      setError(err.message || 'Check-out failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const todayAtt = data?.attendance?.today;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, color: '#1a1f36' }}>Employee Self-Service Portal</h1>
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

      {/* Notifications */}
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
      {successMsg && (
        <div
          style={{
            backgroundColor: '#def7ec',
            color: '#03543f',
            padding: '1rem',
            borderRadius: '6px',
            marginBottom: '1.5rem',
          }}
        >
          {successMsg}
        </div>
      )}

      {/* Profile & Today Status Banner */}
      <div
        style={{
          border: '1px solid #e3e8ee',
          padding: '1.5rem',
          borderRadius: '8px',
          backgroundColor: '#fff',
          marginBottom: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a1f36' }}>
            {data?.profile?.name || user?.name || 'Employee'}
          </div>
          <div style={{ color: '#697386', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            ID: <strong>{data?.profile?.employeeId || 'EMP...'}</strong> | Role: {data?.profile?.jobTitle || 'Staff'} | Email: {data?.profile?.user?.email || user?.email}
          </div>
        </div>

        {/* Quick Check-In / Check-Out Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {!todayAtt ? (
            <button
              onClick={handleCheckIn}
              disabled={actionLoading}
              style={{
                padding: '0.6rem 1.25rem',
                backgroundColor: '#137333',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: actionLoading ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '0.95rem',
              }}
            >
              ⏱️ Check In
            </button>
          ) : !todayAtt.checkOut ? (
            <button
              onClick={handleCheckOut}
              disabled={actionLoading}
              style={{
                padding: '0.6rem 1.25rem',
                backgroundColor: '#c53030',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: actionLoading ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '0.95rem',
              }}
            >
              🚪 Check Out
            </button>
          ) : (
            <span
              style={{
                backgroundColor: '#e6f4ea',
                color: '#137333',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              ✅ Completed Today ({todayAtt.workMinutes || 0}m)
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#697386' }}>Loading dashboard data...</div>
      ) : data ? (
        <>
          {/* Summary Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2rem',
            }}
          >
            {/* Today Status */}
            <div
              style={{
                backgroundColor: '#fff',
                border: '1px solid #e3e8ee',
                borderRadius: '8px',
                padding: '1.25rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ color: '#697386', fontSize: '0.85rem', fontWeight: 500 }}>Today's Status</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: todayAtt ? '#137333' : '#b06000', marginTop: '0.5rem' }}>
                {todayAtt ? todayAtt.status : 'Not Checked In'}
              </div>
              <div style={{ color: '#697386', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                {todayAtt?.checkIn ? `In: ${new Date(todayAtt.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'No record yet'}
              </div>
            </div>

            {/* Pending Leave */}
            <div
              style={{
                backgroundColor: '#fff',
                border: '1px solid #e3e8ee',
                borderRadius: '8px',
                padding: '1.25rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ color: '#697386', fontSize: '0.85rem', fontWeight: 500 }}>Pending Leaves</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#b06000', marginTop: '0.5rem' }}>
                {data.timeOff.pending}
              </div>
              <div style={{ color: '#697386', fontSize: '0.8rem', marginTop: '0.25rem' }}>Awaiting Admin review</div>
            </div>

            {/* Approved Leave */}
            <div
              style={{
                backgroundColor: '#fff',
                border: '1px solid #e3e8ee',
                borderRadius: '8px',
                padding: '1.25rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ color: '#697386', fontSize: '0.85rem', fontWeight: 500 }}>Approved Leaves</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0066cc', marginTop: '0.5rem' }}>
                {data.timeOff.approved}
              </div>
              <div style={{ color: '#697386', fontSize: '0.8rem', marginTop: '0.25rem' }}>Approved requests</div>
            </div>
          </div>

          {/* Module Links */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <button
              onClick={() => navigate('/employee/attendance')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#137333',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.95rem',
              }}
            >
              ⏱️ My Full Attendance
            </button>
            <button
              onClick={() => navigate('/employee/time-off')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#b06000',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.95rem',
              }}
            >
              🌴 Apply / View Time Off
            </button>
            <button
              onClick={() => navigate('/employee/profile')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#0066cc',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.95rem',
              }}
            >
              👤 My Profile
            </button>
            <button
              onClick={() => navigate('/employee/payroll')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#553c9a',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.95rem',
              }}
            >
              💰 My Payroll
            </button>
          </div>

          {/* Recent Records Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
            {/* Recent Attendance (Max 5) */}
            <div
              style={{
                backgroundColor: '#fff',
                border: '1px solid #e3e8ee',
                borderRadius: '8px',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <h3 style={{ margin: '0 0 1rem 0', color: '#1a1f36', fontSize: '1.1rem' }}>Recent Attendance Logs</h3>
              {data.attendance.recent.length === 0 ? (
                <p style={{ color: '#697386', fontSize: '0.9rem' }}>No recent attendance logs found.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {data.attendance.recent.slice(0, 5).map((att) => (
                    <div
                      key={att.id}
                      style={{
                        padding: '0.75rem',
                        backgroundColor: '#f8fafc',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <strong>{new Date(att.date).toLocaleDateString()}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          {att.checkIn ? `In: ${new Date(att.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}{' '}
                          {att.checkOut ? `| Out: ${new Date(att.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                        </div>
                      </div>
                      <div>
                        <span
                          style={{
                            backgroundColor: att.status === 'PRESENT' ? '#e6f4ea' : '#fef3c7',
                            color: att.status === 'PRESENT' ? '#137333' : '#b45309',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                          }}
                        >
                          {att.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Time Off (Max 5) */}
            <div
              style={{
                backgroundColor: '#fff',
                border: '1px solid #e3e8ee',
                borderRadius: '8px',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <h3 style={{ margin: '0 0 1rem 0', color: '#1a1f36', fontSize: '1.1rem' }}>Recent Leave Requests</h3>
              {data.timeOff.recent.length === 0 ? (
                <p style={{ color: '#697386', fontSize: '0.9rem' }}>No recent leave requests found.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {data.timeOff.recent.slice(0, 5).map((req) => (
                    <div
                      key={req.id}
                      style={{
                        padding: '0.75rem',
                        backgroundColor: '#f8fafc',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <strong>{req.leaveType} ({req.days} days)</strong>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <span
                          style={{
                            backgroundColor:
                              req.status === 'APPROVED'
                                ? '#e6f4ea'
                                : req.status === 'REJECTED'
                                ? '#fde8e8'
                                : '#fef3c7',
                            color:
                              req.status === 'APPROVED'
                                ? '#137333'
                                : req.status === 'REJECTED'
                                ? '#c53030'
                                : '#b45309',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                          }}
                        >
                          {req.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default EmployeePage;
