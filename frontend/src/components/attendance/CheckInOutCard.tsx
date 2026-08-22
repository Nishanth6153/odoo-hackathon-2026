import React, { useEffect, useState } from 'react';
import { attendanceService } from '../../services/attendance.service';
import type { TodayAttendance } from '../../types/attendance.types';

interface CheckInOutCardProps {
  todayRecord: TodayAttendance | null;
  onStatusChange: () => void;
}

export const CheckInOutCard: React.FC<CheckInOutCardProps> = ({ todayRecord, onStatusChange }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Real-time live clock for current time
  const [currentTime, setCurrentTime] = useState<string>(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  // Live elapsed working seconds ticker
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Live current clock interval
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);

    return () => clearInterval(clockInterval);
  }, []);

  // Setup timer if checked in but not checked out
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (todayRecord?.checkIn && !todayRecord.checkOut) {
      const checkInTime = new Date(todayRecord.checkIn).getTime();

      const updateElapsed = () => {
        const now = Date.now();
        const diffInSeconds = Math.max(0, Math.floor((now - checkInTime) / 1000));
        setElapsedSeconds(diffInSeconds);
      };

      updateElapsed();
      interval = setInterval(updateElapsed, 1000);
    } else {
      setElapsedSeconds(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [todayRecord]);

  const formatTimestamp = (timeStr: string | null | undefined) => {
    if (!timeStr) return '—';
    try {
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) return timeStr;
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return timeStr;
    }
  };

  const formatMinutes = (mins: number | null | undefined) => {
    if (mins === null || mins === undefined) return '0m';
    const hours = Math.floor(mins / 60);
    const remainder = mins % 60;
    return hours > 0 ? `${hours}h ${remainder}m` : `${remainder}m`;
  };

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
      setSuccessMessage(null);
      await attendanceService.checkIn();
      setSuccessMessage('Successfully checked in! Shift duration is now being tracked.');
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
      setSuccessMessage(null);
      await attendanceService.checkOut();
      setSuccessMessage('Successfully checked out! Shift recorded.');
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

  const hasCheckedIn = Boolean(todayRecord?.checkIn);
  const hasCheckedOut = Boolean(todayRecord?.checkOut);
  const isWorking = hasCheckedIn && !hasCheckedOut;

  const formattedCurrentDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="card card-padding" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Top Status Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <div>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            Attendance Terminal
          </span>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
            {formattedCurrentDate}
          </div>
        </div>

        {/* Dynamic Live State Pill */}
        {!hasCheckedIn ? (
          <span className="badge badge-neutral" style={{ padding: '4px 10px' }}>
            <span className="badge-dot" />
            Not Checked In
          </span>
        ) : isWorking ? (
          <span className="badge badge-success" style={{ padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span className="badge-pulse" />
            YOU'RE WORKING
          </span>
        ) : (
          <span className="badge badge-success" style={{ padding: '4px 10px' }}>
            ✓ WORKDAY COMPLETE
          </span>
        )}
      </div>

      {/* Notifications */}
      {error && (
        <div className="alert alert-error">
          <span>⚠️ {error}</span>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success">
          <span>✓ {successMessage}</span>
        </div>
      )}

      {/* STATE 1: NOT CHECKED IN */}
      {!hasCheckedIn && (
        <div>
          <div
            style={{
              padding: 'var(--space-6)',
              backgroundColor: 'var(--color-bg-subtle)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              textAlign: 'center',
              marginBottom: 'var(--space-5)',
            }}
          >
            <div style={{ fontSize: 'var(--text-4xl)', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)', letterSpacing: '0.02em' }}>
              {currentTime}
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>
              You haven't checked in for today yet. Punch in to begin recording your shift.
            </p>
          </div>

          <button
            onClick={handleCheckIn}
            disabled={isSubmitting}
            className="btn btn-success btn-lg"
            style={{ width: '100%', fontSize: 'var(--text-base)', fontWeight: 600 }}
          >
            {isSubmitting ? 'Recording Check-In...' : '⏱️ Check In'}
          </button>
        </div>
      )}

      {/* STATE 2: CHECKED IN / WORKING */}
      {isWorking && (
        <div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 'var(--space-4)',
              backgroundColor: 'var(--color-success-bg)',
              padding: 'var(--space-5)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-success-border)',
              marginBottom: 'var(--space-5)',
            }}
          >
            <div>
              <span className="stat-label" style={{ color: 'var(--color-success-text)' }}>Check-In Time</span>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-success-text)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                {formatTimestamp(todayRecord?.checkIn)}
              </div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success-text)', opacity: 0.85 }}>Punch verified</span>
            </div>

            <div>
              <span className="stat-label" style={{ color: 'var(--color-success-text)' }}>Live Elapsed Duration</span>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-success-text)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                {formatElapsed(elapsedSeconds)}
              </div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success-text)', opacity: 0.85 }}>Ticking in real-time</span>
            </div>
          </div>

          <button
            onClick={handleCheckOut}
            disabled={isSubmitting}
            className="btn btn-danger btn-lg"
            style={{ width: '100%', fontSize: 'var(--text-base)', fontWeight: 600 }}
          >
            {isSubmitting ? 'Recording Check-Out...' : '🚪 Check Out'}
          </button>
        </div>
      )}

      {/* STATE 3: CHECKED OUT / WORKDAY COMPLETE */}
      {hasCheckedIn && hasCheckedOut && (
        <div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 'var(--space-4)',
              backgroundColor: 'var(--color-bg-subtle)',
              padding: 'var(--space-5)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              marginBottom: 'var(--space-5)',
            }}
          >
            <div>
              <span className="stat-label">Actual Check-In</span>
              <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                {formatTimestamp(todayRecord?.checkIn)}
              </div>
            </div>

            <div>
              <span className="stat-label">Actual Check-Out</span>
              <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                {formatTimestamp(todayRecord?.checkOut)}
              </div>
            </div>

            <div>
              <span className="stat-label">Total Worked</span>
              <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-success)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                {formatMinutes(todayRecord?.workMinutes)}
              </div>
            </div>
          </div>

          <div
            className="alert alert-success"
            style={{ justifyContent: 'center', margin: 0, fontWeight: 500, padding: 'var(--space-3)' }}
          >
            ✓ Workday recorded and synced with monthly payroll logs.
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckInOutCard;
