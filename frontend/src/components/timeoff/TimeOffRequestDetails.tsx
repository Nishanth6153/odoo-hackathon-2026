import React, { useState } from 'react';
import { TimeOffStatusBadge } from './TimeOffStatusBadge';
import type { TimeOffRequest } from '../../types/timeoff.types';

interface TimeOffRequestDetailsProps {
  request: TimeOffRequest;
  onClose: () => void;
  onApprove?: (id: string) => Promise<void>;
  onReject?: (id: string) => Promise<void>;
  isAdminView?: boolean;
}

export const TimeOffRequestDetails: React.FC<TimeOffRequestDetailsProps> = ({
  request,
  onClose,
  onApprove,
  onReject,
  isAdminView = false,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatLeaveType = (type: string) => {
    switch (type) {
      case 'PAID_TIME_OFF':
        return 'Paid Time Off';
      case 'SICK_LEAVE':
        return 'Sick Leave';
      case 'UNPAID_LEAVE':
        return 'Unpaid Leave';
      default:
        return type;
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const handleApprove = async () => {
    if (!onApprove) return;
    try {
      setIsProcessing(true);
      setError(null);
      await onApprove(request.id);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to approve request.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!onReject) return;
    try {
      setIsProcessing(true);
      setError(null);
      await onReject(request.id);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to reject request.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '8px', maxWidth: '550px', width: '100%', padding: '1.75rem', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.3rem' }}>Time-Off Request Details</h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' }}
          >
            ×
          </button>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: '#ffe6e6', color: '#cc0000', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {/* Content Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem' }}>
          {isAdminView && (
            <div style={{ backgroundColor: '#f8f9fa', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e9ecef' }}>
              <strong>Employee:</strong> {request.employeeName || 'Unknown Employee'}
              {request.employeeEmail && <div style={{ fontSize: '0.85rem', color: '#666' }}>Email: {request.employeeEmail}</div>}
              {request.department && <div style={{ fontSize: '0.85rem', color: '#666' }}>Dept: {request.department}</div>}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <strong>Leave Type:</strong>
              <div>{formatLeaveType(request.type)}</div>
            </div>

            <div>
              <strong>Current Status:</strong>
              <div style={{ marginTop: '0.25rem' }}>
                <TimeOffStatusBadge status={request.status} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <strong>Start Date:</strong>
              <div>{formatDate(request.startDate)}</div>
            </div>

            <div>
              <strong>End Date:</strong>
              <div>{formatDate(request.endDate)}</div>
            </div>
          </div>

          <div>
            <strong>Reason for Leave:</strong>
            <p style={{ margin: '0.35rem 0 0', padding: '0.75rem', backgroundColor: '#f5f5f5', borderRadius: '4px', color: '#444', whiteSpace: 'pre-wrap' }}>
              {request.reason}
            </p>
          </div>

          {request.attachmentUrl && (
            <div>
              <strong>Attachment:</strong>
              <div style={{ marginTop: '0.25rem' }}>
                <a href={request.attachmentUrl} target="_blank" rel="noreferrer" style={{ color: '#0066cc' }}>
                  📎 View Attachment Document
                </a>
              </div>
            </div>
          )}

          {request.createdAt && (
            <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.5rem', borderTop: '1px solid #eee', paddingTop: '0.75rem' }}>
              Submitted on: {formatDate(request.createdAt)}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
          <button
            onClick={onClose}
            disabled={isProcessing}
            style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff', cursor: 'pointer' }}
          >
            Close
          </button>

          {isAdminView && request.status === 'PENDING' && (
            <>
              <button
                onClick={handleReject}
                disabled={isProcessing}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: isProcessing ? '#888' : '#dc3545',
                  color: '#fff',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  fontWeight: 500,
                }}
              >
                {isProcessing ? 'Processing...' : 'Reject Request'}
              </button>

              <button
                onClick={handleApprove}
                disabled={isProcessing}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: isProcessing ? '#888' : '#137333',
                  color: '#fff',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  fontWeight: 500,
                }}
              >
                {isProcessing ? 'Processing...' : 'Approve Request'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
