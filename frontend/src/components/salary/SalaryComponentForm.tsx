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

  const isEarning = category === 'EARNING';

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {apiError && (
        <div className="alert alert-error">
          <span>⚠️ {apiError}</span>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="name" className="form-label">
          Component Name *
        </label>
        <input
          id="name"
          type="text"
          placeholder="e.g. Basic Salary, HRA, Provident Fund"
          {...register('name')}
          disabled={isSubmitting}
          className="form-input"
        />
        {errors.name && <span className="form-error">{errors.name.message}</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <div className="form-group">
          <label htmlFor="category" className="form-label">
            Category *
          </label>
          <select
            id="category"
            {...register('category')}
            disabled={isSubmitting}
            className="form-select"
          >
            <option value="EARNING">Earning (+)</option>
            <option value="DEDUCTION">Deduction (-)</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="calculationType" className="form-label">
            Calculation Type *
          </label>
          <select
            id="calculationType"
            {...register('calculationType')}
            disabled={isSubmitting}
            className="form-select"
          >
            <option value="PERCENTAGE">Percentage (%)</option>
            <option value="FIXED">Fixed Amount (₹)</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="value" className="form-label">
          {calculationType === 'PERCENTAGE' ? 'Percentage Value (%)' : 'Fixed Amount (₹)'} *
        </label>
        <input
          id="value"
          type="number"
          step="any"
          {...register('value', { valueAsNumber: true })}
          disabled={isSubmitting}
          className="form-input"
        />
        {errors.value && <span className="form-error">{errors.value.message}</span>}
      </div>

      {/* Live Dynamic Preview Banner */}
      <div
        className={isEarning ? 'alert alert-success' : 'alert alert-error'}
        style={{ margin: 0, display: 'block' }}
      >
        <div style={{ fontSize: 'var(--text-xs)', fontWeight: 500, opacity: 0.85 }}>Dynamic Calculation Preview</div>
        <div style={{ fontWeight: 700, fontSize: 'var(--text-lg)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
          {isEarning ? '+' : '-'} ₹{calculatedPreview.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          {calculationType === 'PERCENTAGE' && (
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'normal', opacity: 0.85, marginLeft: 'var(--space-2)' }}>
              ({value}% of ₹{monthlyWage.toLocaleString()})
            </span>
          )}
        </div>
      </div>

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

export default SalaryComponentForm;
