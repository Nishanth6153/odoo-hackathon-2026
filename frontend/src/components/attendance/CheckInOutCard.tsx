import React, { useEffect, useState } from 'react';
import { attendanceService } from '../../services/attendance.service';
import { AttendanceStatusBadge } from './AttendanceStatusBadge';
import type { TodayAttendance } from '../../types/attendance.types';

interface CheckInOutCardProps {
  todayRecord: TodayAttendance | null;
  onStatusChange: () => void;
}

export const CheckInOutCard: React.FC<CheckInOutCardProps> = ({ todayRecord, onStatusChange }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live timer for active check-in
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return '—';
    try {
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) return timeStr;
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return timeStr;
    }
  };

  const formatMinutes = (mins: number | null) => {
    if (mins === null || mins === undefined) return '—';
    const hours = Math.floor(mins / 60);
    const remainder = mins % 60;
    return `${hours}h ${remainder}m`;
  };

  // Setup timer if checked in but not checked out
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (todayRecord?.checkIn && !todayRecord.checkOut) {
      const checkInDate = new Date(todayRecord.checkIn).getTime();

      const updateTimer = () => {
        const now = Date.now();
        const diffInSeconds = Math.max(0, Math.floor((now - checkInDate) / 1000));
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
  }, [todayRecord]);

  const formatElapsed = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  };

  const handleCheckIn = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      await attendanceService.checkIn();
      onStatusChange();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to check in.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      await attendanceService.checkOut();
      onStatusChange();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to check out.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCheckedIn = !!todayRecord?.checkIn && !todayRecord?.checkOut;

  return (
    <div style={{ border: '1px solid #e0e0e0', borderRadius: '12px', padding: '1.75rem', backgroundColor: '#ffffff', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#111' }}>Today's Attendance</h2>
          <span style={{ fontSize: '0.85rem', color: '#666' }}>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <AttendanceStatusBadge status={todayRecord?.status} />
      </div>

      {error && (
        <div style={{ padding: '0.75rem', backgroundColor: '#ffe6e6', color: '#cc0000', borderRadius: '6px', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      {/* Main Status & Timer Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', backgroundColor: '#f8f9fa', padding: '1.25rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
        <div>
          <span style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' }}>Check In Time</span>
          <strong style={{ fontSize: '1.1rem', color: '#222' }}>{formatTime(todayRecord?.checkIn || null)}</strong>
        </div>

        <div>
          <span style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' }}>Check Out Time</span>
          <strong style={{ fontSize: '1.1rem', color: '#222' }}>{formatTime(todayRecord?.checkOut || null)}</strong>
        </div>

        <div>
          <span style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' }}>Work Duration</span>
          <strong style={{ fontSize: '1.1rem', color: isCheckedIn ? '#0066cc' : '#222' }}>
            {isCheckedIn ? formatElapsed(elapsedSeconds) : formatMinutes(todayRecord?.workMinutes || null)}
          </strong>
        </div>
      </div>

      {/* Action Buttons */}
      <div>
        {!todayRecord?.checkIn ? (
          <button
            onClick={handleCheckIn}
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '0.85rem',
              fontSize: '1rem',
              fontWeight: 600,
              color: '#ffffff',
              backgroundColor: isSubmitting ? '#999' : '#137333',
              border: 'none',
              borderRadius: '6px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            {isSubmitting ? 'Checking In...' : '🟢 Check In'}
          </button>
        ) : isCheckedIn ? (
          <button
            onClick={handleCheckOut}
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '0.85rem',
              fontSize: '1rem',
              fontWeight: 600,
              color: '#ffffff',
              backgroundColor: isSubmitting ? '#999' : '#d93025',
              border: 'none',
              borderRadius: '6px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            {isSubmitting ? 'Checking Out...' : '🔴 Check Out'}
          </button>
        ) : (
          <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: '#e6f4ea', color: '#137333', fontWeight: 600, borderRadius: '6px' }}>
            ✅ Workday Completed
          </div>
        )}
      </div>
    </div>
  );
};
