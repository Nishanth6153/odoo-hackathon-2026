import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const leaveDays = monthRecords.filter((r) => r.status === 'ON_LEAVE').length;
  const absentDays = monthRecords.filter((r) => r.status === 'ABSENT').length;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <button
        onClick={() => navigate('/employee')}
        style={{ marginBottom: '1rem', background: 'none', border: 'none', color: '#0066cc', cursor: 'pointer', textDecoration: 'underline' }}
      >
        ← Back to Employee Dashboard
      </button>

      <h1 style={{ marginTop: 0, marginBottom: '1.5rem' }}>My Attendance</h1>

      {/* Check In / Check Out Card */}
      <div style={{ marginBottom: '2rem' }}>
        <CheckInOutCard todayRecord={todayRecord} onStatusChange={fetchAttendanceData} />
      </div>

      {/* Monthly Attendance Section */}
      <div style={{ border: '1px solid #e0e0e0', borderRadius: '12px', padding: '1.75rem', backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Attendance History</h2>

          {/* Month Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => setMonthOffset((prev) => prev - 1)}
              style={{ padding: '0.4rem 0.8rem', backgroundColor: '#f0f0f0', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
            >
              ◀ Previous Month
            </button>
            <span style={{ fontWeight: 600, minWidth: '130px', textAlign: 'center' }}>
              {selectedMonthDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={() => setMonthOffset((prev) => prev + 1)}
              disabled={monthOffset >= 0}
              style={{
                padding: '0.4rem 0.8rem',
                backgroundColor: monthOffset >= 0 ? '#f5f5f5' : '#f0f0f0',
                color: monthOffset >= 0 ? '#aaa' : '#000',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: monthOffset >= 0 ? 'not-allowed' : 'pointer',
              }}
            >
              Next Month ▶
            </button>
          </div>
        </div>

        {/* Summary Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '8px', textAlign: 'center', border: '1px solid #e9ecef' }}>
            <span style={{ fontSize: '0.8rem', color: '#666' }}>Total Logged Days</span>
            <strong style={{ display: 'block', fontSize: '1.5rem', color: '#222', marginTop: '0.2rem' }}>{totalDays}</strong>
          </div>
          <div style={{ backgroundColor: '#e6f4ea', padding: '1rem', borderRadius: '8px', textAlign: 'center', border: '1px solid #ceebd6' }}>
            <span style={{ fontSize: '0.8rem', color: '#137333' }}>Present Days</span>
            <strong style={{ display: 'block', fontSize: '1.5rem', color: '#137333', marginTop: '0.2rem' }}>{presentDays}</strong>
          </div>
          <div style={{ backgroundColor: '#e8f0fe', padding: '1rem', borderRadius: '8px', textAlign: 'center', border: '1px solid #d2e3fc' }}>
            <span style={{ fontSize: '0.8rem', color: '#1a73e8' }}>Leave Days</span>
            <strong style={{ display: 'block', fontSize: '1.5rem', color: '#1a73e8', marginTop: '0.2rem' }}>{leaveDays}</strong>
          </div>
          <div style={{ backgroundColor: '#fef7e0', padding: '1rem', borderRadius: '8px', textAlign: 'center', border: '1px solid #fde7ac' }}>
            <span style={{ fontSize: '0.8rem', color: '#b06000' }}>Absent Days</span>
            <strong style={{ display: 'block', fontSize: '1.5rem', color: '#b06000', marginTop: '0.2rem' }}>{absentDays}</strong>
          </div>
        </div>

        {/* Content Table / States */}
        {loading ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: '#666' }}>Loading attendance records...</div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#ffe6e6', borderRadius: '8px', color: '#cc0000' }}>
            <p style={{ margin: '0 0 1rem' }}>{error}</p>
            <button
              onClick={fetchAttendanceData}
              style={{ padding: '0.5rem 1rem', backgroundColor: '#0066cc', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Retry
            </button>
          </div>
        ) : (
          <AttendanceTable records={monthRecords} />
        )}
      </div>
    </div>
  );
};

export default MyAttendancePage;
