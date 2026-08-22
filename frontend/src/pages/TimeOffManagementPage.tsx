import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { timeOffService } from '../services/timeoff.service';
import { TimeOffRequestList } from '../components/timeoff/TimeOffRequestList';
import { TimeOffRequestDetails } from '../components/timeoff/TimeOffRequestDetails';
import type { TimeOffRequest, TimeOffStatus } from '../types/timeoff.types';

export const TimeOffManagementPage: React.FC = () => {
  const navigate = useNavigate();

  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TimeOffStatus | 'ALL'>('ALL');

  // Selected request for details modal
  const [selectedRequest, setSelectedRequest] = useState<TimeOffRequest | null>(null);

  const fetchAllRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await timeOffService.getTimeOffRequests();
      setRequests(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch time-off requests.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRequests();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      setFeedbackSuccess(null);
      await timeOffService.approveTimeOffRequest(id);
      setFeedbackSuccess('✅ Leave request approved successfully. Attendance records have been synced.');
      setSelectedRequest(null);
      await fetchAllRequests();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  const handleReject = async (id: string) => {
    try {
      setFeedbackSuccess(null);
      await timeOffService.rejectTimeOffRequest(id);
      setFeedbackSuccess('❌ Leave request rejected.');
      setSelectedRequest(null);
      await fetchAllRequests();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  // Filter requests dynamically by search query & status filter
  const filteredRequests = requests.filter((req) => {
    if (statusFilter !== 'ALL' && req.status !== statusFilter) {
      return false;
    }

    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    return (
      req.employeeName?.toLowerCase().includes(q) ||
      req.employeeEmail?.toLowerCase().includes(q) ||
      req.department?.toLowerCase().includes(q) ||
      req.type?.toLowerCase().includes(q) ||
      req.reason?.toLowerCase().includes(q)
    );
  });

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;

  return (
    <>
      <Navbar portalTitle="Administration" />

      <main className="page-container">
        {/* Header & Back Link */}
        <div className="page-header">
          <div className="page-title-group">
            <button
              onClick={() => navigate('/admin')}
              className="back-link"
            >
              ← Back to Dashboard
            </button>
            <h1>Time Off & Leave Requests</h1>
            <p>Review leave applications, manage employee time-off, and track approvals</p>
          </div>

          <button
            onClick={fetchAllRequests}
            disabled={loading}
            className="btn btn-secondary btn-sm"
          >
            🔄 {loading ? 'Refreshing...' : 'Refresh Requests'}
          </button>
        </div>

        {/* Feedback Success / Error Banners */}
        {feedbackSuccess && (
          <div className="alert alert-success" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{feedbackSuccess}</span>
            <button onClick={() => setFeedbackSuccess(null)} className="btn btn-sm btn-secondary">
              Dismiss
            </button>
          </div>
        )}

        {error && (
          <div className="alert alert-error" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="btn btn-sm btn-danger">
              Dismiss
            </button>
          </div>
        )}

        {/* Control Bar: Search & Status Filters */}
        <div className="card card-padding" style={{ marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          {/* Status Filter Buttons */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`btn btn-sm ${statusFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            >
              All ({requests.length})
            </button>

            <button
              onClick={() => setStatusFilter('PENDING')}
              className={`btn btn-sm ${statusFilter === 'PENDING' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ color: statusFilter === 'PENDING' ? undefined : 'var(--color-warning)' }}
            >
              ⏳ Pending ({pendingCount})
            </button>

            <button
              onClick={() => setStatusFilter('APPROVED')}
              className={`btn btn-sm ${statusFilter === 'APPROVED' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ color: statusFilter === 'APPROVED' ? undefined : 'var(--color-success)' }}
            >
              ✅ Approved
            </button>

            <button
              onClick={() => setStatusFilter('REJECTED')}
              className={`btn btn-sm ${statusFilter === 'REJECTED' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ color: statusFilter === 'REJECTED' ? undefined : 'var(--color-error)' }}
            >
              ❌ Rejected
            </button>
          </div>

          {/* Search Input */}
          <div style={{ flex: 1, minWidth: '240px', maxWidth: '380px' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employee, department, reason..."
              className="form-input"
            />
          </div>
        </div>

        {/* Selected Request Modal */}
        {selectedRequest && (
          <TimeOffRequestDetails
            request={selectedRequest}
            onClose={() => setSelectedRequest(null)}
            onApprove={handleApprove}
            onReject={handleReject}
            isAdminView={true}
          />
        )}

        {/* Main Request List / States */}
        {loading ? (
          <div className="card card-padding">
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ padding: 'var(--space-3) 0', borderBottom: '1px solid var(--color-border)' }}>
                <div className="skeleton skeleton-text" style={{ width: '30%' }} />
                <div className="skeleton skeleton-text" style={{ width: '70%' }} />
              </div>
            ))}
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🌴</div>
            <div className="empty-state-title">No Requests Found</div>
            <p className="empty-state-desc">No time-off requests match your current filter criteria.</p>
          </div>
        ) : (
          <TimeOffRequestList
            requests={filteredRequests}
            showEmployeeInfo={true}
            onSelectRequest={(req) => setSelectedRequest(req)}
          />
        )}
      </main>
    </>
  );
};

export default TimeOffManagementPage;
