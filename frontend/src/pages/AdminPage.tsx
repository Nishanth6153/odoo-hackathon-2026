import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { employeeService } from '../services/employee.service';
import { attendanceService } from '../services/attendance.service';
import { timeOffService } from '../services/timeoff.service';
import { PageTransition } from '../components/motion/PageTransition';
import { Reveal } from '../components/motion/Reveal';
import { CardInteraction } from '../components/motion/CardInteraction';

export const AdminPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  // Workforce Pulse Real Data State
  const [totalEmployeesCount, setTotalEmployeesCount] = useState(0);
  const [presentCount, setPresentCount] = useState(0);
  const [onLeaveCount, setOnLeaveCount] = useState(0);
  const [pendingLeaveCount, setPendingLeaveCount] = useState(0);

  const fetchWorkforcePulse = async () => {
    try {
      setLoading(true);
      const [employees, attendance, leaveRequests] = await Promise.all([
        employeeService.getEmployees().catch(() => []),
        attendanceService.getAttendance().catch(() => []),
        timeOffService.getTimeOffRequests().catch(() => []),
      ]);

      setTotalEmployeesCount(employees.length);

      const todayStr = new Date().toISOString().split('T')[0];
      const todayAttendance = attendance.filter((a) => a.date && a.date.startsWith(todayStr));

      const present = todayAttendance.filter((a) => a.status === 'PRESENT' || !!a.checkIn).length;
      const onLeave = todayAttendance.filter((a) => a.status === 'ON_LEAVE').length;
      const pendingLeave = leaveRequests.filter((r) => r.status === 'PENDING').length;

      setPresentCount(present);
      setOnLeaveCount(onLeave);
      setPendingLeaveCount(pendingLeave);
    } catch {
      // Keep UI resilient
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkforcePulse();
  }, []);

  const notCheckedInCount = Math.max(0, totalEmployeesCount - (presentCount + onLeaveCount));

  return (
    <PageTransition>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0066cc', letterSpacing: '1px' }}>
              ADMINISTRATIVE DASHBOARD
            </span>
            <h1 style={{ margin: '0.2rem 0 0', fontSize: '2.2rem', color: '#111' }}>Workforce Pulse</h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: '#555' }}>
              Logged in as <strong>{user?.name}</strong> ({user?.role})
            </span>
            <button
              onClick={logout}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#ffe6e6',
                color: '#cc0000',
                border: '1px solid #ffcccc',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Real Workforce Pulse Metric Cards */}
        <Reveal delay={0.1}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
              <span style={{ fontSize: '0.85rem', color: '#666', fontWeight: 500 }}>Total Workforce</span>
              <strong style={{ display: 'block', fontSize: '2.2rem', color: '#111', marginTop: '0.3rem' }}>
                {loading ? '...' : totalEmployeesCount}
              </strong>
              <span style={{ fontSize: '0.8rem', color: '#888' }}>Active Team Members</span>
            </div>

            <div style={{ backgroundColor: '#e6f4ea', border: '1px solid #ceebd6', borderRadius: '12px', padding: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#137333', fontWeight: 500 }}>● Present Today</span>
              <strong style={{ display: 'block', fontSize: '2.2rem', color: '#137333', marginTop: '0.3rem' }}>
                {loading ? '...' : presentCount}
              </strong>
              <span style={{ fontSize: '0.8rem', color: '#137333' }}>Checked In & Active</span>
            </div>

            <div style={{ backgroundColor: '#e8f0fe', border: '1px solid #d2e3fc', borderRadius: '12px', padding: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#1a73e8', fontWeight: 500 }}>● On Leave</span>
              <strong style={{ display: 'block', fontSize: '2.2rem', color: '#1a73e8', marginTop: '0.3rem' }}>
                {loading ? '...' : onLeaveCount}
              </strong>
              <span style={{ fontSize: '0.8rem', color: '#1a73e8' }}>Approved Leave Today</span>
            </div>

            <div style={{ backgroundColor: '#feefe3', border: '1px solid #fad7c0', borderRadius: '12px', padding: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#b06000', fontWeight: 500 }}>● Not Checked In</span>
              <strong style={{ display: 'block', fontSize: '2.2rem', color: '#b06000', marginTop: '0.3rem' }}>
                {loading ? '...' : notCheckedInCount}
              </strong>
              <span style={{ fontSize: '0.8rem', color: '#b06000' }}>Pending Check-In</span>
            </div>
          </div>
        </Reveal>

        {/* Needs Attention Section */}
        <Reveal delay={0.2}>
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '14px', padding: '1.75rem', marginBottom: '2.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <h2 style={{ marginTop: 0, fontSize: '1.25rem', color: '#111', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#d93025' }}>🚨</span> Needs Attention
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <CardInteraction onClick={() => navigate('/admin/time-off')}>
                <div style={{ padding: '1.25rem', borderRadius: '10px', backgroundColor: pendingLeaveCount > 0 ? '#fff8e6' : '#f8f9fa', border: `1px solid ${pendingLeaveCount > 0 ? '#ffe0b2' : '#e0e0e0'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: '#222' }}>Pending Leave Requests</span>
                    <span style={{ backgroundColor: pendingLeaveCount > 0 ? '#b06000' : '#888', color: '#fff', padding: '0.25rem 0.65rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      {pendingLeaveCount}
                    </span>
                  </div>
                  <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#666' }}>
                    {pendingLeaveCount > 0 ? 'Click to review and process pending requests.' : 'All leave requests processed.'}
                  </p>
                </div>
              </CardInteraction>

              <CardInteraction onClick={() => navigate('/admin/attendance')}>
                <div style={{ padding: '1.25rem', borderRadius: '10px', backgroundColor: notCheckedInCount > 0 ? '#feefe3' : '#f8f9fa', border: `1px solid ${notCheckedInCount > 0 ? '#fad7c0' : '#e0e0e0'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: '#222' }}>Pending Today Check-Ins</span>
                    <span style={{ backgroundColor: notCheckedInCount > 0 ? '#d93025' : '#888', color: '#fff', padding: '0.25rem 0.65rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      {notCheckedInCount}
                    </span>
                  </div>
                  <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#666' }}>
                    {notCheckedInCount > 0 ? 'Click to inspect today’s attendance log.' : 'All active employees checked in.'}
                  </p>
                </div>
              </CardInteraction>
            </div>
          </div>
        </Reveal>

        {/* Management Portals Navigation */}
        <Reveal delay={0.3}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#111' }}>Management Portals</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
            <CardInteraction onClick={() => navigate('/admin/employees')}>
              <div style={{ border: '1px solid #e0e0e0', borderRadius: '12px', padding: '1.5rem', backgroundColor: '#ffffff' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>👥</div>
                <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.2rem', color: '#111' }}>Employees Directory</h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#666' }}>Manage employee profiles, onboarding, and credentials.</p>
              </div>
            </CardInteraction>

            <CardInteraction onClick={() => navigate('/admin/attendance')}>
              <div style={{ border: '1px solid #e0e0e0', borderRadius: '12px', padding: '1.5rem', backgroundColor: '#ffffff' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>⏱️</div>
                <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.2rem', color: '#111' }}>Attendance Management</h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#666' }}>Inspect daily workforce attendance, dates, and hours.</p>
              </div>
            </CardInteraction>

            <CardInteraction onClick={() => navigate('/admin/time-off')}>
              <div style={{ border: '1px solid #e0e0e0', borderRadius: '12px', padding: '1.5rem', backgroundColor: '#ffffff' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>🌴</div>
                <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.2rem', color: '#111' }}>Time Off & Leave</h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#666' }}>Review, approve, or reject employee leave applications.</p>
              </div>
            </CardInteraction>
          </div>
        </Reveal>
      </div>
    </PageTransition>
  );
};

export default AdminPage;
