import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { attendanceService } from '../services/attendance.service';
import { CheckInOutCard } from '../components/attendance/CheckInOutCard';
import { AttendanceTable } from '../components/attendance/AttendanceTable';
import type { AttendanceRecord, TodayAttendance } from '../types/attendance.types';

export const MyAttendancePage: React.FC = () => {
  const navigate = useNavigate();

  const [todayRecord, setTodayRecord] = useState<TodayAttendance | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Month navigation: offset in months from current date (0 = current month)
  const [monthOffset, setMonthOffset] = useState(0);

  const getSelectedMonthDate = () => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthOffset);
    return d;
  };

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch today's status & history in parallel
      const [todayData, historyData] = await Promise.all([
        attendanceService.getMyTodayAttendance().catch(() => null),
        attendanceService.getMyAttendance().catch((err) => {
          throw err;
        }),
      ]);

      setTodayRecord(todayData);
      setRecords(historyData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load attendance data.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const selectedMonthDate = getSelectedMonthDate();
  const selectedYear = selectedMonthDate.getFullYear();
  const selectedMonth = selectedMonthDate.getMonth();

  // Filter records by selected month & year
  const monthRecords = records.filter((rec) => {
    if (!rec.date) return false;
    const d = new Date(rec.date);
    return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
  });

  // Calculate summary metrics
  const totalDays = monthRecords.length;
  const presentDays = monthRecords.filter((r) => r.status === 'PRESENT').length;
  const leaveDays = monthRecords.filter((r) => r.status === 'ON_LEAVE' || r.status === 'LEAVE').length;
  const absentDays = monthRecords.filter((r) => r.status === 'ABSENT').length;

  return (
    <>
      <Navbar portalTitle="Employee Workspace" />

      <main className="page-container">
        {/* Header */}
        <div className="page-header">
          <div className="page-title-group">
            <button
              onClick={() => navigate('/employee')}
              className="back-link"
            >
              ← Back to Dashboard
            </button>
            <h1>My Attendance</h1>
            <p>Punch in/out, view daily work hours, and inspect monthly attendance log</p>
          </div>
        </div>

        {/* Check In / Check Out Card */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <CheckInOutCard todayRecord={todayRecord} onStatusChange={fetchAttendanceData} />
        </div>

        {/* Monthly Attendance Section */}
        <div className="card card-padding">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <h2 style={{ margin: 0, fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
              Monthly History
            </h2>

            {/* Month Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <button
                onClick={() => setMonthOffset((prev) => prev - 1)}
                className="btn btn-secondary btn-sm"
              >
                ◀ Prev Month
              </button>
              <span style={{ fontWeight: 600, minWidth: '140px', textAlign: 'center', fontSize: 'var(--text-sm)' }}>
                {selectedMonthDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={() => setMonthOffset((prev) => prev + 1)}
                disabled={monthOffset >= 0}
                className="btn btn-secondary btn-sm"
              >
                Next Month ▶
              </button>
            </div>
          </div>

          {/* Summary Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
            <div className="stat-card" style={{ padding: 'var(--space-3)', textAlign: 'center' }}>
              <span className="stat-label">Total Logged</span>
              <div className="stat-value" style={{ fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)' }}>{totalDays}</div>
            </div>
            <div className="stat-card" style={{ padding: 'var(--space-3)', textAlign: 'center' }}>
              <span className="stat-label">Present</span>
              <div className="stat-value" style={{ fontSize: 'var(--text-xl)', color: 'var(--color-success)' }}>{presentDays}</div>
            </div>
            <div className="stat-card" style={{ padding: 'var(--space-3)', textAlign: 'center' }}>
              <span className="stat-label">On Leave</span>
              <div className="stat-value" style={{ fontSize: 'var(--text-xl)', color: 'var(--color-info)' }}>{leaveDays}</div>
            </div>
            <div className="stat-card" style={{ padding: 'var(--space-3)', textAlign: 'center' }}>
              <span className="stat-label">Absent</span>
              <div className="stat-value" style={{ fontSize: 'var(--text-xl)', color: 'var(--color-error)' }}>{absentDays}</div>
            </div>
          </div>

          {/* Content Table / States */}
          {loading ? (
            <div className="loading-box">
              <div className="spinner" />
              <span>Loading attendance history...</span>
            </div>
          ) : error ? (
            <div className="alert alert-error" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{error}</span>
              <button onClick={fetchAttendanceData} className="btn btn-sm btn-danger">
                Retry
              </button>
            </div>
          ) : (
            <AttendanceTable records={monthRecords} />
          )}
        </div>
      </main>
    </>
  );
};

export default MyAttendancePage;
