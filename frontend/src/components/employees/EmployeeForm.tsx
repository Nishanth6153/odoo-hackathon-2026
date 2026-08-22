import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Employee, EmployeeStatus } from '../../types/employee.types';

const employeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
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
    <form onSubmit={handleSubmit(handleFormSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {apiError && (
        <div style={{ padding: '0.75rem', backgroundColor: '#ffe6e6', color: '#cc0000', borderRadius: '4px', fontSize: '0.875rem' }}>
          {apiError}
        </div>
      )}

      <div>
        <label htmlFor="name" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>
          Full Name *
        </label>
        <input
          id="name"
          type="text"
          {...register('name')}
          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          disabled={isSubmitting}
        />
        {errors.name && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.name.message}</span>}
      </div>

      <div>
        <label htmlFor="email" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>
          Email Address *
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          disabled={isSubmitting}
        />
        {errors.email && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.email.message}</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label htmlFor="phone" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>
            Phone Number
          </label>
          <input
            id="phone"
            type="text"
            {...register('phone')}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="department" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>
            Department
          </label>
          <input
            id="department"
            type="text"
            {...register('department')}
            placeholder="e.g. Engineering, HR"
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label htmlFor="designation" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>
            Designation
          </label>
          <input
            id="designation"
            type="text"
            {...register('designation')}
            placeholder="e.g. Software Engineer"
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="joiningDate" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>
            Joining Date
          </label>
          <input
            id="joiningDate"
            type="date"
            {...register('joiningDate')}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {initialValues && (
        <div>
          <label htmlFor="status" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>
            Status
          </label>
          <select
            id="status"
            {...register('status')}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            disabled={isSubmitting}
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff', cursor: 'pointer' }}
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '0.5rem 1.25rem',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: isSubmitting ? '#888' : '#0066cc',
            color: '#fff',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            fontWeight: 500,
          }}
        >
          {isSubmitting ? 'Submitting...' : submitButtonText}
        </button>
      </div>
    </form>
  );
};
