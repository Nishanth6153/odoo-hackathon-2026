import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { attendanceService } from '../services/attendance.service';
import { AttendanceTable } from '../components/attendance/AttendanceTable';
import type { AttendanceRecord } from '../types/attendance.types';

export const AttendancePage: React.FC = () => {
  const navigate = useNavigate();

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Date Navigation (ISO YYYY-MM-DD format for filtering)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAllAttendance = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await attendanceService.getAttendance();
      setRecords(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unable to load attendance records.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAttendance();
  }, []);

  const changeDateByDays = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Filter records by selected date & search query
  const filteredRecords = records.filter((rec) => {
    const matchDate = rec.date ? rec.date.startsWith(selectedDate) : true;
    if (!matchDate) return false;

    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    return (
      rec.employeeName?.toLowerCase().includes(q) ||
      rec.employeeEmail?.toLowerCase().includes(q) ||
      rec.department?.toLowerCase().includes(q) ||
      rec.employeeId?.toLowerCase().includes(q)
    );
  });

  const formattedSelectedDate = new Date(selectedDate).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <Navbar portalTitle="Administration" />

      <main className="page-container">
        {/* Navigation & Header */}
        <div className="page-header">
          <div className="page-title-group">
            <button
              onClick={() => navigate('/admin')}
              className="back-link"
            >
              ← Back to Dashboard
            </button>
            <h1>Attendance Management</h1>
            <p>Monitor daily attendance, time logs, and overtime across all departments</p>
          </div>

          <button
            onClick={fetchAllAttendance}
            className="btn btn-secondary btn-sm"
          >
            🔄 Refresh Records
          </button>
        </div>

        {/* Controls Bar: Date Navigation & Search */}
        <div className="card card-padding" style={{ marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          {/* Date Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <button
              onClick={() => changeDateByDays(-1)}
              className="btn btn-secondary btn-sm"
            >
              ◀ Prev
            </button>

            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="btn btn-primary btn-sm"
            >
              Today
            </button>

            <button
              onClick={() => changeDateByDays(1)}
              className="btn btn-secondary btn-sm"
            >
              Next ▶
            </button>

            <span style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginLeft: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
              {formattedSelectedDate}
            </span>
          </div>

          {/* Search Field */}
          <div style={{ flex: 1, minWidth: '240px', maxWidth: '380px' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employee, email, department, ID..."
              className="form-input"
            />
          </div>
        </div>

        {/* Main Content Area */}
        {loading ? (
          <div className="loading-box">
            <div className="spinner" />
            <span>Loading attendance records...</span>
          </div>
        ) : error ? (
          <div className="alert alert-error" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{error}</span>
            <button onClick={fetchAllAttendance} className="btn btn-sm btn-danger">
              Retry
            </button>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">⏱️</div>
            <div className="empty-state-title">No Attendance Records</div>
            <p className="empty-state-desc">No attendance records found for {formattedSelectedDate}.</p>
          </div>
        ) : (
          <AttendanceTable records={filteredRecords} showEmployeeInfo={true} />
        )}
      </main>
    </>
  );
};

export default AttendancePage;
