import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useAuth } from '../context/AuthContext';
import { LoginForm } from '../components/auth/LoginForm';
import { PageTransition } from '../components/motion/PageTransition';

export const LoginPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const heroRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN' || user.role === 'HR') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/employee', { replace: true });
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    if (heroRef.current && cardRef.current) {
      gsap.fromTo(
        heroRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, scale: 0.96, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6, delay: 0.2, ease: 'back.out(1.2)' }
      );
    }
  }, []);

  return (
    <PageTransition>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#f4f6f8',
          padding: '1rem',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div ref={heroRef} style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏢</div>
          <h1 style={{ margin: 0, fontSize: '2.2rem', color: '#111' }}>Dayflow HRMS</h1>
          <p style={{ margin: '0.4rem 0 0', color: '#666', fontSize: '1rem' }}>
            Enterprise Human Resource & Workforce Management System
          </p>
        </div>

        <div
          ref={cardRef}
          style={{
            width: '100%',
            maxWidth: '420px',
            borderRadius: '16px',
            backgroundColor: '#ffffff',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            border: '1px solid #e0e0e0',
            overflow: 'hidden',
          }}
        >
          <LoginForm />
        </div>
      </div>
    </PageTransition>
  );
};

export default LoginPage;
