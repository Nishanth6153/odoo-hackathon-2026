import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const timeOffSchema = z
  .object({
    type: z.enum(['PAID_TIME_OFF', 'SICK_LEAVE', 'UNPAID_LEAVE'] as const, {
      message: 'Please select a valid time off type',
    }),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    reason: z.string().min(3, 'Reason must be at least 3 characters'),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: 'End date cannot be before start date',
    path: ['endDate'],
  });

export type TimeOffFormData = z.infer<typeof timeOffSchema>;

interface TimeOffFormProps {
  onSubmit: (data: TimeOffFormData) => Promise<void>;
  onCancel?: () => void;
  apiError?: string | null;
}

export const TimeOffForm: React.FC<TimeOffFormProps> = ({ onSubmit, onCancel, apiError }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TimeOffFormData>({
    resolver: zodResolver(timeOffSchema),
    defaultValues: {
      type: 'PAID_TIME_OFF',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      reason: '',
    },
  });

  const selectedType = watch('type');

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {apiError && (
        <div className="alert alert-error">
          <span>⚠️ {apiError}</span>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="type" className="form-label">
          Leave Type *
        </label>
        <select
          id="type"
          {...register('type')}
          disabled={isSubmitting}
          className="form-select"
        >
          <option value="PAID_TIME_OFF">Paid Time Off (Annual)</option>
          <option value="SICK_LEAVE">Sick Leave</option>
          <option value="UNPAID_LEAVE">Unpaid Leave</option>
        </select>
        {errors.type && <span className="form-error">{errors.type.message}</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <div className="form-group">
          <label htmlFor="startDate" className="form-label">
            Start Date *
          </label>
          <input
            id="startDate"
            type="date"
            {...register('startDate')}
            disabled={isSubmitting}
            className="form-input"
          />
          {errors.startDate && <span className="form-error">{errors.startDate.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="endDate" className="form-label">
            End Date *
          </label>
          <input
            id="endDate"
            type="date"
            {...register('endDate')}
            disabled={isSubmitting}
            className="form-input"
          />
          {errors.endDate && <span className="form-error">{errors.endDate.message}</span>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="reason" className="form-label">
          Reason for Request *
        </label>
        <textarea
          id="reason"
          rows={3}
          {...register('reason')}
          placeholder="Please explain the reason for your time-off request..."
          disabled={isSubmitting}
          className="form-textarea"
        />
        {errors.reason && <span className="form-error">{errors.reason.message}</span>}
      </div>

      {selectedType === 'SICK_LEAVE' && (
        <div className="alert alert-info" style={{ fontSize: 'var(--text-xs)' }}>
          ℹ️ Medical leave records can be documented with supporting details.
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
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </div>
    </form>
  );
};

export default TimeOffForm;
