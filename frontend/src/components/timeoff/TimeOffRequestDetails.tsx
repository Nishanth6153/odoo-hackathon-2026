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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-dialog-header">
          <h2 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)' }}>
            Time-Off Request Details
          </h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            style={{ background: 'none', border: 'none', fontSize: 'var(--text-xl)', cursor: 'pointer', color: 'var(--color-text-muted)', lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        <div className="modal-dialog-body">
          {error && (
            <div className="alert alert-error">
              <span>⚠️ {error}</span>
            </div>
          )}

          {/* Content Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
            {isAdminView && (
              <div style={{ backgroundColor: 'var(--color-bg-subtle)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{request.employeeName || 'Unknown Employee'}</div>
                {request.employeeEmail && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{request.employeeEmail}</div>}
                {request.department && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Dept: {request.department}</div>}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div>
                <span className="stat-label">Leave Type</span>
                <div style={{ fontWeight: 500, color: 'var(--color-text-primary)', marginTop: '2px' }}>{formatLeaveType(request.type)}</div>
              </div>

              <div>
                <span className="stat-label">Current Status</span>
                <div style={{ marginTop: '4px' }}>
                  <TimeOffStatusBadge status={request.status} />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div>
                <span className="stat-label">Start Date</span>
                <div style={{ color: 'var(--color-text-primary)', marginTop: '2px' }}>{formatDate(request.startDate)}</div>
              </div>

              <div>
                <span className="stat-label">End Date</span>
                <div style={{ color: 'var(--color-text-primary)', marginTop: '2px' }}>{formatDate(request.endDate)}</div>
              </div>
            </div>

            <div>
              <span className="stat-label">Reason for Leave</span>
              <p style={{ margin: 'var(--space-1) 0 0', padding: 'var(--space-3)', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', whiteSpace: 'pre-wrap' }}>
                {request.reason}
              </p>
            </div>

            {request.attachmentUrl && (
              <div>
                <span className="stat-label">Attachment</span>
                <div style={{ marginTop: 'var(--space-1)' }}>
                  <a href={request.attachmentUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)' }}>
                    📎 View Attachment Document
                  </a>
                </div>
              </div>
            )}

            {request.createdAt && (
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)' }}>
                Submitted on: {formatDate(request.createdAt)}
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-6)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="btn btn-secondary"
            >
              Close
            </button>

            {isAdminView && request.status === 'PENDING' && (
              <>
                <button
                  onClick={handleReject}
                  disabled={isProcessing}
                  className="btn btn-danger"
                >
                  {isProcessing ? 'Processing...' : 'Reject'}
                </button>

                <button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="btn btn-success"
                >
                  {isProcessing ? 'Processing...' : 'Approve'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeOffRequestDetails;
