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
    <div className="card card-padding">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)' }}>Today's Attendance</h2>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
        <AttendanceStatusBadge status={todayRecord?.status} />
      </div>

      {error && (
        <div className="alert alert-error">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Main Status & Timer Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)', backgroundColor: 'var(--color-bg-subtle)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-5)', border: '1px solid var(--color-border)' }}>
        <div>
          <span className="stat-label">Check-In Time</span>
          <strong style={{ display: 'block', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', marginTop: 'var(--space-1)' }}>
            {formatTime(todayRecord?.checkIn || null)}
          </strong>
        </div>

        <div>
          <span className="stat-label">Check-Out Time</span>
          <strong style={{ display: 'block', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', marginTop: 'var(--space-1)' }}>
            {formatTime(todayRecord?.checkOut || null)}
          </strong>
        </div>

        <div>
          <span className="stat-label">Work Duration</span>
          <strong style={{ display: 'block', fontSize: 'var(--text-base)', color: isCheckedIn ? 'var(--color-primary)' : 'var(--color-text-primary)', marginTop: 'var(--space-1)', fontFamily: isCheckedIn ? 'var(--font-mono)' : undefined }}>
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
            className="btn btn-success btn-lg"
            style={{ width: '100%' }}
          >
            {isSubmitting ? 'Checking In...' : '⏱️ Check In For Today'}
          </button>
        ) : isCheckedIn ? (
          <button
            onClick={handleCheckOut}
            disabled={isSubmitting}
            className="btn btn-danger btn-lg"
            style={{ width: '100%' }}
          >
            {isSubmitting ? 'Checking Out...' : '🚪 Check Out'}
          </button>
        ) : (
          <div className="alert alert-success" style={{ justifyContent: 'center', margin: 0, fontWeight: 600 }}>
            ✅ Workday Completed ({formatMinutes(todayRecord?.workMinutes || null)})
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckInOutCard;
