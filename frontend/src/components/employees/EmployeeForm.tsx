import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Employee, EmployeeStatus } from '../../types/employee.types';

const employeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  joiningDate: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE'] as const).optional(),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  initialValues?: Partial<Employee>;
  onSubmit: (data: EmployeeFormData) => Promise<void>;
  onCancel?: () => void;
  submitButtonText?: string;
  apiError?: string | null;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  submitButtonText = 'Save Employee',
  apiError,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: initialValues?.name || '',
      email: initialValues?.email || '',
      password: '',
      phone: initialValues?.phone || '',
      department: initialValues?.department || '',
      designation: initialValues?.designation || '',
      joiningDate: initialValues?.joiningDate || '',
      status: (initialValues?.status as EmployeeStatus) || 'ACTIVE',
    },
  });

  const handleFormSubmit = async (data: EmployeeFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {apiError && (
        <div className="alert alert-error">
          <span>⚠️ {apiError}</span>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="name" className="form-label">
          Full Name *
        </label>
        <input
          id="name"
          type="text"
          {...register('name')}
          className="form-input"
          placeholder="e.g. Jane Doe"
          disabled={isSubmitting}
        />
        {errors.name && <span className="form-error">{errors.name.message}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="email" className="form-label">
          Email Address *
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className="form-input"
          placeholder="e.g. jane.doe@dayflow.local"
          disabled={isSubmitting}
        />
        {errors.email && <span className="form-error">{errors.email.message}</span>}
      </div>

      {/* Password field - only for creating new employees */}
      {!initialValues && (
        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Account Password
          </label>
          <input
            id="password"
            type="password"
            {...register('password')}
            placeholder="Leave blank for default: Employee@123"
            className="form-input"
            disabled={isSubmitting}
          />
          <span className="form-hint">Default: Employee@123</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <div className="form-group">
          <label htmlFor="phone" className="form-label">
            Phone Number
          </label>
          <input
            id="phone"
            type="text"
            {...register('phone')}
            placeholder="+1 555 0192"
            className="form-input"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="department" className="form-label">
            Department
          </label>
          <input
            id="department"
            type="text"
            {...register('department')}
            placeholder="e.g. Engineering, HR"
            className="form-input"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <div className="form-group">
          <label htmlFor="designation" className="form-label">
            Job Title / Designation
          </label>
          <input
            id="designation"
            type="text"
            {...register('designation')}
            placeholder="e.g. Senior Software Engineer"
            className="form-input"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="joiningDate" className="form-label">
            Joining Date
          </label>
          <input
            id="joiningDate"
            type="date"
            {...register('joiningDate')}
            className="form-input"
            disabled={isSubmitting}
          />
        </div>
      </div>

      {initialValues && (
        <div className="form-group">
          <label htmlFor="status" className="form-label">
            Employment Status
          </label>
          <select
            id="status"
            {...register('status')}
            className="form-select"
            disabled={isSubmitting}
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>
      )}

      <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary"
        >
          {isSubmitting ? 'Saving...' : submitButtonText}
        </button>
      </div>
    </form>
  );
};

export default EmployeeForm;
