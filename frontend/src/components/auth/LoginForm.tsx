import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../context/AuthContext';
import type { LoginCredentials } from '../../types/auth.types';

const loginSchema = z.object({
  loginId: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      loginId: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setApiError(null);
      const credentials: LoginCredentials = {
        loginId: data.loginId,
        password: data.password,
      };
      const user = await login(credentials);

      if (user.role === 'ADMIN' || user.role === 'HR') {
        navigate('/admin');
      } else if (user.role === 'EMPLOYEE') {
        navigate('/employee');
      } else {
        navigate('/login');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setApiError(err.message);
      } else {
        setApiError('An unexpected error occurred. Please try again.');
      }
    }
  };

  const fillCredentials = (email: string, pass: string) => {
    setValue('loginId', email);
    setValue('password', pass);
  };

  return (
    <div className="card card-padding" style={{ maxWidth: '420px', width: '100%', margin: '0 auto', boxShadow: 'var(--shadow-lg)' }}>
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
          <span className="nav-brand-badge" style={{ fontSize: 'var(--text-sm)', padding: '6px 12px' }}>DAYFLOW</span>
          <span style={{ fontWeight: 700, fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)' }}>HRMS</span>
        </div>
        <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)' }}>Sign In to Your Portal</h2>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
          Enter your organization credentials to proceed
        </p>
      </div>

      {apiError && (
        <div className="alert alert-error">
          <span>⚠️ {apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label htmlFor="loginId" className="form-label">
            Email Address
          </label>
          <input
            id="loginId"
            type="email"
            placeholder="name@dayflow.local"
            {...register('loginId')}
            className="form-input"
            disabled={isSubmitting}
          />
          {errors.loginId && (
            <span className="form-error">{errors.loginId.message}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            className="form-input"
            disabled={isSubmitting}
          />
          {errors.password && (
            <span className="form-error">{errors.password.message}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary btn-lg"
          style={{ width: '100%', marginTop: 'var(--space-2)' }}
        >
          {isSubmitting ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>

      {/* Quick Demo Shortcuts */}
      <div style={{ marginTop: 'var(--space-6)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
        <span style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: 'var(--space-2)' }}>
          Quick Demo Credentials:
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
          <button
            type="button"
            onClick={() => fillCredentials('admin@dayflow.local', 'Admin@123')}
            className="btn btn-secondary btn-sm"
          >
            👑 Admin / HR
          </button>
          <button
            type="button"
            onClick={() => fillCredentials('employee@dayflow.local', 'Employee@123')}
            className="btn btn-secondary btn-sm"
          >
            👤 Employee
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
