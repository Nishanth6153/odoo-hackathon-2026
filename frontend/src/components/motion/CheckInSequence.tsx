import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface CheckInSequenceProps {
  active: boolean;
  type: 'check-in' | 'check-out';
  onComplete?: () => void;
}

export const CheckInSequence: React.FC<CheckInSequenceProps> = ({ active, type, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const checkmarkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (active && containerRef.current && ringRef.current && checkmarkRef.current) {
      const tl = gsap.timeline({
        onComplete: () => {
          if (onComplete) onComplete();
        },
      });

      tl.fromTo(
        containerRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' }
      )
        .fromTo(
          ringRef.current,
          { scale: 0.5, opacity: 0 },
          { scale: 1.2, opacity: 0.8, duration: 0.4, ease: 'power2.out' },
          '-=0.2'
        )
        .to(ringRef.current, { scale: 1.4, opacity: 0, duration: 0.3, ease: 'power1.out' })
        .fromTo(
          checkmarkRef.current,
          { scale: 0, rotate: -30 },
          { scale: 1, rotate: 0, duration: 0.4, ease: 'elastic.out(1, 0.5)' },
          '-=0.4'
        )
        .to(containerRef.current, { opacity: 0, scale: 1.05, duration: 0.4, delay: 0.4 });
    }
  }, [active, type, onComplete]);

  if (!active) return null;

  const isCheckIn = type === 'check-in';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.35)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        pointerEvents: 'none',
      }}
    >
      <div
        ref={containerRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          backgroundColor: '#ffffff',
          padding: '2.5rem 3.5rem',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          position: 'relative',
        }}
      >
        <div
          ref={ringRef}
          style={{
            position: 'absolute',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            border: `3px solid ${isCheckIn ? '#137333' : '#d93025'}`,
            top: '30px',
          }}
        />

        <div
          ref={checkmarkRef}
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: isCheckIn ? '#e6f4ea' : '#fce8e6',
            color: isCheckIn ? '#137333' : '#d93025',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.2rem',
            fontWeight: 'bold',
          }}
        >
          {isCheckIn ? '✓' : '👋'}
        </div>

        <div style={{ textAlign: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#111' }}>
            {isCheckIn ? 'Workday Started!' : 'Workday Complete!'}
          </h3>
          <p style={{ margin: '0.35rem 0 0', color: '#666', fontSize: '0.9rem' }}>
            {isCheckIn ? 'Have a productive day.' : 'Great job today.'}
          </p>
        </div>
      </div>
    </div>
  );
};
