import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { attendanceService } from '../services/attendance.service';
import { PageTransition } from '../components/motion/PageTransition';
import { Reveal } from '../components/motion/Reveal';
import { StatusTransition } from '../components/motion/StatusTransition';
import { CardInteraction } from '../components/motion/CardInteraction';
import { CheckInSequence } from '../components/motion/CheckInSequence';
import { AttendanceStatusBadge } from '../components/attendance/AttendanceStatusBadge';
import type { TodayAttendance } from '../types/attendance.types';

export const EmployeePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [todayRecord, setTodayRecord] = useState<TodayAttendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Live Clock
  const [currentTime, setCurrentTime] = useState(new Date());

  // Signature Sequence Trigger
  const [sequenceState, setSequenceState] = useState<{ active: boolean; type: 'check-in' | 'check-out' }>({
    active: false,
    type: 'check-in',
  });

  // Active Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const fetchTodayStatus = async () => {
    try {
      setLoading(true);
      const data = await attendanceService.getMyTodayAttendance();
      setTodayRecord(data);
    } catch {
      // Keep state clean
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayStatus();
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Timer for active check-in
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (todayRecord?.checkIn && !todayRecord.checkOut) {
      const checkInTime = new Date(todayRecord.checkIn).getTime();
      const updateTimer = () => {
        const now = Date.now();
        setElapsedSeconds(Math.max(0, Math.floor((now - checkInTime) / 1000)));
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

  const handleCheckIn = async () => {
    try {
      setIsSubmitting(true);
      setApiError(null);
      await attendanceService.checkIn();
      setSequenceState({ active: true, type: 'check-in' });
      await fetchTodayStatus();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setApiError(err.message);
      } else {
        setApiError('Check-in failed.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setIsSubmitting(true);
      setApiError(null);
      await attendanceService.checkOut();
      setSequenceState({ active: true, type: 'check-out' });
      await fetchTodayStatus();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setApiError(err.message);
      } else {
        setApiError('Check-out failed.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'GOOD MORNING';
    if (hour < 18) return 'GOOD AFTERNOON';
    return 'GOOD EVENING';
  };

  const formatTimeString = (iso?: string | null) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  };

  const formatElapsed = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  };

  const formatMinutes = (mins: number | null | undefined) => {
    if (mins === null || mins === undefined) return '—';
    const hours = Math.floor(mins / 60);
    const remainder = mins % 60;
    return `${hours}h ${remainder}m`;
  };

  const isCheckedIn = !!todayRecord?.checkIn && !todayRecord?.checkOut;
  const isCheckedOut = !!todayRecord?.checkIn && !!todayRecord?.checkOut;
  const isOnLeave = todayRecord?.status === 'ON_LEAVE';

  const getWorkdayStatusKey = () => {
    if (isOnLeave) return 'ON_LEAVE';
    if (isCheckedOut) return 'CHECKED_OUT';
    if (isCheckedIn) return 'CHECKED_IN';
    return 'READY_TO_START';
  };

  return (
    <PageTransition>
      <CheckInSequence
        active={sequenceState.active}
        type={sequenceState.type}
        onComplete={() => setSequenceState({ active: false, type: 'check-in' })}
      />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
        {/* Navigation & User Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0066cc', letterSpacing: '1px' }}>
              {getGreeting()}, {user?.name?.toUpperCase()}
            </span>
            <h1 style={{ margin: '0.2rem 0 0', fontSize: '2.2rem', color: '#111' }}>Your Workday</h1>
          </div>

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

        {/* Live Date & Time Display */}
        <Reveal delay={0.1}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', backgroundColor: '#ffffff', padding: '1.25rem 1.75rem', borderRadius: '12px', border: '1px solid #e0e0e0', marginBottom: '1.75rem', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>TODAY</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#222' }}>
                {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#0066cc', fontFamily: 'monospace' }}>
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          </div>
        </Reveal>

        {apiError && (
          <div style={{ padding: '0.85rem', backgroundColor: '#ffe6e6', color: '#cc0000', borderRadius: '8px', marginBottom: '1.5rem' }}>
            {apiError}
          </div>
        )}

        {/* Dynamic Workday State Hero Banner */}
        <Reveal delay={0.2}>
          <StatusTransition statusKey={getWorkdayStatusKey()}>
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e0e0e0', color: '#666' }}>
                Loading workday state...
              </div>
            ) : isOnLeave ? (
              <div style={{ backgroundColor: '#e8f0fe', border: '1px solid #b3d1ff', borderRadius: '14px', padding: '2rem', textAlign: 'center' }}>
                <AttendanceStatusBadge status="ON_LEAVE" />
                <h2 style={{ margin: '1rem 0 0.5rem', color: '#1a73e8', fontSize: '1.6rem' }}>Away Today</h2>
                <p style={{ margin: 0, color: '#555' }}>You are on approved leave today. Enjoy your time off.</p>
              </div>
            ) : isCheckedOut ? (
              <div style={{ backgroundColor: '#e6f4ea', border: '1px solid #ceebd6', borderRadius: '14px', padding: '2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎉</div>
                <h2 style={{ margin: '0 0 0.5rem', color: '#137333', fontSize: '1.6rem' }}>Workday Complete</h2>
                <p style={{ margin: '0 0 1rem', color: '#555' }}>
                  Checked In: <strong>{formatTimeString(todayRecord?.checkIn)}</strong> • Checked Out: <strong>{formatTimeString(todayRecord?.checkOut)}</strong>
                </p>
                <div style={{ display: 'inline-block', padding: '0.4rem 1rem', backgroundColor: '#ffffff', borderRadius: '20px', fontWeight: 'bold', color: '#137333', border: '1px solid #ceebd6' }}>
                  Total Worked: {formatMinutes(todayRecord?.workMinutes)}
                </div>
              </div>
            ) : isCheckedIn ? (
              <div style={{ backgroundColor: '#ffffff', border: '2px solid #34a853', borderRadius: '14px', padding: '2rem', boxShadow: '0 4px 12px rgba(52, 168, 83, 0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#34a853', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
                    <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#137333' }}>Workday Active</h2>
                  </div>
                  <span style={{ fontSize: '0.9rem', color: '#555' }}>
                    Since <strong>{formatTimeString(todayRecord?.checkIn)}</strong>
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: '#f8f9fa', padding: '1.25rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.8rem', color: '#666' }}>Checked In At</span>
                    <strong style={{ fontSize: '1.2rem', color: '#222' }}>{formatTimeString(todayRecord?.checkIn)}</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.8rem', color: '#666' }}>Active Duration</span>
                    <strong style={{ fontSize: '1.2rem', color: '#0066cc', fontFamily: 'monospace' }}>{formatElapsed(elapsedSeconds)}</strong>
                  </div>
                </div>

                <button
                  onClick={handleCheckOut}
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '0.9rem',
                    backgroundColor: isSubmitting ? '#888' : '#d93025',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                >
                  {isSubmitting ? 'Checking Out...' : '🔴 Complete Workday (Check Out)'}
                </button>
              </div>
            ) : (
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '14px', padding: '2rem', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
                <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.6rem', color: '#111' }}>Ready to Start Your Day</h2>
                <p style={{ margin: '0 0 1.5rem', color: '#666' }}>Click below to record your check-in time for today.</p>

                <button
                  onClick={handleCheckIn}
                  disabled={isSubmitting}
                  style={{
                    padding: '1rem 2.5rem',
                    backgroundColor: isSubmitting ? '#888' : '#137333',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(19, 115, 51, 0.25)',
                    transition: 'transform 0.15s, background-color 0.2s',
                  }}
                >
                  {isSubmitting ? 'Checking In...' : '🟢 Start Workday (Check In)'}
                </button>
              </div>
            )}
          </StatusTransition>
        </Reveal>

        {/* Quick Action Cards Grid */}
        <Reveal delay={0.3}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem', marginTop: '2rem' }}>
            <CardInteraction onClick={() => navigate('/employee/attendance')}>
              <div style={{ border: '1px solid #e0e0e0', borderRadius: '12px', padding: '1.5rem', backgroundColor: '#ffffff' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>⏱️</div>
                <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.2rem', color: '#111' }}>My Attendance</h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#666' }}>View monthly check-in history & work hours logs.</p>
              </div>
            </CardInteraction>

            <CardInteraction onClick={() => navigate('/employee/time-off')}>
              <div style={{ border: '1px solid #e0e0e0', borderRadius: '12px', padding: '1.5rem', backgroundColor: '#ffffff' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>🌴</div>
                <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.2rem', color: '#111' }}>Time Off & Leave</h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#666' }}>Apply for leave & check your request status.</p>
              </div>
            </CardInteraction>

            <CardInteraction onClick={() => navigate('/employee/profile')}>
              <div style={{ border: '1px solid #e0e0e0', borderRadius: '12px', padding: '1.5rem', backgroundColor: '#ffffff' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>👤</div>
                <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.2rem', color: '#111' }}>My Profile</h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#666' }}>View personal details, skills, and account info.</p>
              </div>
            </CardInteraction>
          </div>
        </Reveal>
      </div>
    </PageTransition>
  );
};

export default EmployeePage;
