import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { CalculationType, SalaryComponentCategory } from '../../types/salary.types';

const componentSchema = z.object({
  name: z.string().min(1, 'Component name is required'),
  category: z.enum(['EARNING', 'DEDUCTION'] as const),
  calculationType: z.enum(['FIXED', 'PERCENTAGE'] as const),
  value: z.number({ message: 'Value must be a number' }).positive('Value must be greater than 0'),
});

export type SalaryComponentFormData = z.infer<typeof componentSchema>;

interface SalaryComponentFormProps {
  initialValues?: Partial<SalaryComponentFormData>;
  monthlyWage: number;
  onSubmit: (data: SalaryComponentFormData) => Promise<void>;
  onCancel?: () => void;
  apiError?: string | null;
  submitButtonText?: string;
}

export const SalaryComponentForm: React.FC<SalaryComponentFormProps> = ({
  initialValues,
  monthlyWage,
  onSubmit,
  onCancel,
  apiError,
  submitButtonText = 'Save Component',
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SalaryComponentFormData>({
    resolver: zodResolver(componentSchema),
    defaultValues: {
      name: initialValues?.name || '',
      category: (initialValues?.category as SalaryComponentCategory) || 'EARNING',
      calculationType: (initialValues?.calculationType as CalculationType) || 'PERCENTAGE',
      value: initialValues?.value !== undefined ? initialValues.value : 10,
    },
  });

  const category = watch('category');
  const calculationType = watch('calculationType');
  const value = watch('value') || 0;

  // Live calculation preview
  const calculatedPreview =
    calculationType === 'PERCENTAGE'
      ? (monthlyWage * value) / 100
      : value;

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {apiError && (
        <div style={{ padding: '0.75rem', backgroundColor: '#ffe6e6', color: '#cc0000', borderRadius: '4px', fontSize: '0.875rem' }}>
          {apiError}
        </div>
      )}

      <div>
        <label htmlFor="name" style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 500 }}>
          Component Name *
        </label>
        <input
          id="name"
          type="text"
          placeholder="e.g. Basic Salary, HRA, Professional Tax"
          {...register('name')}
          disabled={isSubmitting}
          style={{ width: '100%', padding: '0.55rem', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
        />
        {errors.name && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.name.message}</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label htmlFor="category" style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 500 }}>
            Category *
          </label>
          <select
            id="category"
            {...register('category')}
            disabled={isSubmitting}
            style={{ width: '100%', padding: '0.55rem', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          >
            <option value="EARNING">Earning (+)</option>
            <option value="DEDUCTION">Deduction (-)</option>
          </select>
        </div>

        <div>
          <label htmlFor="calculationType" style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 500 }}>
            Calculation Type *
          </label>
          <select
            id="calculationType"
            {...register('calculationType')}
            disabled={isSubmitting}
            style={{ width: '100%', padding: '0.55rem', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          >
            <option value="PERCENTAGE">Percentage (%)</option>
            <option value="FIXED">Fixed Amount (₹)</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="value" style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 500 }}>
          {calculationType === 'PERCENTAGE' ? 'Percentage Value (%)' : 'Fixed Amount (₹)'} *
        </label>
        <input
          id="value"
          type="number"
          step="any"
          {...register('value', { valueAsNumber: true })}
          disabled={isSubmitting}
          style={{ width: '100%', padding: '0.55rem', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
        />
        {errors.value && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.value.message}</span>}
      </div>

      {/* Live Dynamic Preview Banner */}
      <div
        style={{
          padding: '0.85rem',
          borderRadius: '6px',
          backgroundColor: category === 'EARNING' ? '#e6f4ea' : '#fce8e6',
          border: `1px solid ${category === 'EARNING' ? '#34a853' : '#ea4335'}`,
          fontSize: '0.9rem',
        }}
      >
        <div style={{ color: '#555', fontSize: '0.8rem', fontWeight: 500 }}>Dynamic Preview Calculation</div>
        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: category === 'EARNING' ? '#137333' : '#c5221f', marginTop: '0.2rem' }}>
          {category === 'EARNING' ? '+' : '-'} ₹{calculatedPreview.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          {calculationType === 'PERCENTAGE' && (
            <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: '#555', marginLeft: '0.5rem' }}>
              ({value}% of ₹{monthlyWage.toLocaleString()})
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            style={{ padding: '0.55rem 1rem', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff', cursor: 'pointer' }}
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '0.55rem 1.25rem',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: isSubmitting ? '#888' : '#0066cc',
            color: '#fff',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            fontWeight: 500,
          }}
        >
          {isSubmitting ? 'Saving...' : submitButtonText}
        </button>
      </div>
    </form>
  );
};
