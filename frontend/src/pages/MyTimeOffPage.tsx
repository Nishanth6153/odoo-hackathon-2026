import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { timeOffService } from '../services/timeoff.service';
import { LeaveBalanceCard } from '../components/timeoff/LeaveBalanceCard';
import { TimeOffForm, type TimeOffFormData } from '../components/timeoff/TimeOffForm';
import { TimeOffRequestList } from '../components/timeoff/TimeOffRequestList';
import { TimeOffRequestDetails } from '../components/timeoff/TimeOffRequestDetails';
import type { LeaveBalances, TimeOffRequest } from '../types/timeoff.types';

export const MyTimeOffPage: React.FC = () => {
  const navigate = useNavigate();

  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [balances, setBalances] = useState<LeaveBalances | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);

  // Form & details state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<TimeOffRequest | null>(null);
  const [formApiError, setFormApiError] = useState<string | null>(null);

  const fetchMyTimeOffData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [requestsData, balancesData] = await Promise.all([
        timeOffService.getMyTimeOffRequests(),
        timeOffService.getLeaveBalances(),
      ]);

      setRequests(requestsData);
      setBalances(balancesData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load your time-off requests.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTimeOffData();
  }, []);

  const handleApplySubmit = async (formData: TimeOffFormData) => {
    try {
      setFormApiError(null);
      setSubmissionSuccess(null);
      await timeOffService.createTimeOffRequest({
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
      });

      setShowApplyModal(false);
      setSubmissionSuccess('🎉 Your time-off application has been submitted successfully and is queued for administrator review.');
      await fetchMyTimeOffData(); // Immediate refresh of balances & history
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormApiError(err.message);
      } else {
        setFormApiError('Failed to submit request.');
      }
    }
  };

  return (
    <>
      <Navbar portalTitle="Employee Workspace" />

      <main className="page-container">
        {/* Navigation & Header */}
        <div className="page-header">
          <div className="page-title-group">
            <button
              onClick={() => navigate('/employee')}
              className="back-link"
            >
              ← Back to Dashboard
            </button>
            <h1>My Time Off & Requests</h1>
            <p>Track your leave balance entitlements and apply for paid or sick time off</p>
          </div>

          <button
            onClick={() => {
              setFormApiError(null);
              setShowApplyModal(true);
            }}
            className="btn btn-primary"
          >
            + Apply for Time Off
          </button>
        </div>

        {/* Submission Success Alert */}
        {submissionSuccess && (
          <div className="alert alert-success" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
            <span>{submissionSuccess}</span>
            <button onClick={() => setSubmissionSuccess(null)} className="btn btn-sm btn-secondary">
              Dismiss
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
            <span>⚠️ {error}</span>
            <button onClick={fetchMyTimeOffData} className="btn btn-sm btn-danger">
              Retry
            </button>
          </div>
        )}

        {/* Leave Balances Section */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <LeaveBalanceCard balances={balances} loading={loading} />
        </div>

        {/* Apply Form Modal */}
        {showApplyModal && (
          <div className="modal-overlay" onClick={() => setShowApplyModal(false)}>
            <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="modal-dialog-header">
                <h2 style={{ margin: 0, fontSize: 'var(--text-lg)' }}>Apply for Time Off</h2>
                <button
                  onClick={() => setShowApplyModal(false)}
                  style={{ background: 'none', border: 'none', fontSize: 'var(--text-xl)', cursor: 'pointer', color: 'var(--color-text-muted)', lineHeight: 1 }}
                >
                  ×
                </button>
              </div>

              <div className="modal-dialog-body">
                <TimeOffForm
                  onSubmit={handleApplySubmit}
                  onCancel={() => setShowApplyModal(false)}
                  apiError={formApiError}
                />
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {selectedRequest && (
          <TimeOffRequestDetails
            request={selectedRequest}
            onClose={() => setSelectedRequest(null)}
          />
        )}

        {/* Request History Section */}
        <div className="card card-padding">
          <h2 style={{ margin: '0 0 var(--space-4)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
            Request History
          </h2>

          {loading ? (
            <div>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ padding: 'var(--space-3) 0', borderBottom: '1px solid var(--color-border)' }}>
                  <div className="skeleton skeleton-text" style={{ width: '35%' }} />
                  <div className="skeleton skeleton-text" style={{ width: '65%' }} />
                </div>
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🌴</div>
              <div className="empty-state-title">No Requests Found</div>
              <p className="empty-state-desc">You have not submitted any leave requests yet.</p>
            </div>
          ) : (
            <TimeOffRequestList
              requests={requests}
              onSelectRequest={(req) => setSelectedRequest(req)}
            />
          )}
        </div>
      </main>
    </>
  );
};

export default MyTimeOffPage;
