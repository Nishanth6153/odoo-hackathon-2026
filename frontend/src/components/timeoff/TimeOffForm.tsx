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
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      {apiError && (
        <div style={{ padding: '0.75rem', backgroundColor: '#ffe6e6', color: '#cc0000', borderRadius: '4px', fontSize: '0.875rem' }}>
          {apiError}
        </div>
      )}

      <div>
        <label htmlFor="type" style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 500 }}>
          Leave Type *
        </label>
        <select
          id="type"
          {...register('type')}
          disabled={isSubmitting}
          style={{ width: '100%', padding: '0.55rem', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
        >
          <option value="PAID_TIME_OFF">Paid Time Off</option>
          <option value="SICK_LEAVE">Sick Leave</option>
          <option value="UNPAID_LEAVE">Unpaid Leave</option>
        </select>
        {errors.type && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.type.message}</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label htmlFor="startDate" style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 500 }}>
            Start Date *
          </label>
          <input
            id="startDate"
            type="date"
            {...register('startDate')}
            disabled={isSubmitting}
            style={{ width: '100%', padding: '0.55rem', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
          {errors.startDate && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.startDate.message}</span>}
        </div>

        <div>
          <label htmlFor="endDate" style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 500 }}>
            End Date *
          </label>
          <input
            id="endDate"
            type="date"
            {...register('endDate')}
            disabled={isSubmitting}
            style={{ width: '100%', padding: '0.55rem', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
          {errors.endDate && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.endDate.message}</span>}
        </div>
      </div>

      <div>
        <label htmlFor="reason" style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 500 }}>
          Reason for Request *
        </label>
        <textarea
          id="reason"
          rows={3}
          {...register('reason')}
          placeholder="Please explain the reason for your time-off request..."
          disabled={isSubmitting}
          style={{ width: '100%', padding: '0.55rem', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
        />
        {errors.reason && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.reason.message}</span>}
      </div>

      {selectedType === 'SICK_LEAVE' && (
        <div style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', border: '1px dashed #ccc', borderRadius: '4px', fontSize: '0.85rem', color: '#666' }}>
          ℹ️ <strong>Sick Leave Attachment:</strong> File upload integration is pending backend multipart API confirmation.
        </div>
      )}

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
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </div>
    </form>
  );
};
