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

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '2rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Login</h2>
      {apiError && (
        <div style={{ color: 'red', marginBottom: '1rem', padding: '0.5rem', background: '#ffe6e6', borderRadius: '4px' }}>
          {apiError}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="loginId" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Email
          </label>
          <input
            id="loginId"
            type="email"
            {...register('loginId')}
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
            disabled={isSubmitting}
          />
          {errors.loginId && (
            <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.loginId.message}</span>
          )}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Password
          </label>
          <input
            id="password"
            type="password"
            {...register('password')}
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
            disabled={isSubmitting}
          />
          {errors.password && (
            <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.password.message}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: isSubmitting ? '#999' : '#0066cc',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
          }}
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};
