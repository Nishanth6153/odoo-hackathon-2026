import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    // Match date if provided in record
    const matchDate = rec.date ? rec.date.startsWith(selectedDate) : true;
    if (!matchDate) return false;

    // Match search query
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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      {/* Navigation & Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <button
            onClick={() => navigate('/admin')}
            style={{ marginBottom: '0.5rem', background: 'none', border: 'none', color: '#0066cc', cursor: 'pointer', textDecoration: 'underline' }}
          >
            ← Back to Admin Dashboard
          </button>
          <h1 style={{ margin: 0 }}>Attendance Management</h1>
        </div>

        <button
          onClick={fetchAllAttendance}
          style={{
            padding: '0.55rem 1.1rem',
            backgroundColor: '#0066cc',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          🔄 Refresh Attendance
        </button>
      </div>

      {/* Controls Bar: Date Navigation & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem', backgroundColor: '#fff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
        {/* Date Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => changeDateByDays(-1)}
            style={{ padding: '0.4rem 0.8rem', backgroundColor: '#f0f0f0', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
          >
            ◀ Previous Day
          </button>

          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            style={{ padding: '0.4rem 0.8rem', backgroundColor: '#eef2f6', border: '1px solid #0066cc', color: '#0066cc', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
          >
            Today
          </button>

          <button
            onClick={() => changeDateByDays(1)}
            style={{ padding: '0.4rem 0.8rem', backgroundColor: '#f0f0f0', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
          >
            Next Day ▶
          </button>

          <span style={{ fontWeight: 600, color: '#333', marginLeft: '0.5rem' }}>
            {formattedSelectedDate}
          </span>
        </div>

        {/* Search Field */}
        <div style={{ flex: 1, minWidth: '250px', maxWidth: '400px' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employee, email, department, ID..."
            style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>Loading attendance records...</div>
      ) : error ? (
        <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#ffe6e6', borderRadius: '8px', color: '#cc0000' }}>
          <p style={{ margin: '0 0 1rem' }}>{error}</p>
          <button
            onClick={fetchAllAttendance}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#0066cc', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '8px', color: '#777' }}>
          No attendance records found for {formattedSelectedDate}.
        </div>
      ) : (
        <AttendanceTable records={filteredRecords} showEmployeeInfo={true} />
      )}
    </div>
  );
};

export default AttendancePage;
