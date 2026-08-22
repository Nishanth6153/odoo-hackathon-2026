import React from 'react';
import { LoginForm } from '../components/auth/LoginForm';

export const LoginPage: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg)',
        padding: 'var(--space-4)',
      }}
    >
      <LoginForm />
    </div>
  );
};

export default LoginPage;
