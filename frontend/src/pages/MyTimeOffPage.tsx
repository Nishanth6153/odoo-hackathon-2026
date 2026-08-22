import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
      await timeOffService.createTimeOffRequest({
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
      });

      setShowApplyModal(false);
      fetchMyTimeOffData(); // Refresh list & balances
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormApiError(err.message);
      } else {
        setFormApiError('Failed to submit request.');
      }
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      {/* Navigation & Header */}
      <button
        onClick={() => navigate('/employee')}
        style={{ marginBottom: '1rem', background: 'none', border: 'none', color: '#0066cc', cursor: 'pointer', textDecoration: 'underline' }}
      >
        ← Back to Employee Dashboard
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ margin: 0 }}>My Time Off & Requests</h1>

        <button
          onClick={() => {
            setFormApiError(null);
            setShowApplyModal(true);
          }}
          style={{
            padding: '0.65rem 1.25rem',
            backgroundColor: '#0066cc',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          + Apply for Time Off
        </button>
      </div>

      {/* Leave Balances Section */}
      <LeaveBalanceCard balances={balances} loading={loading} />

      {/* Apply Form Modal */}
      {showApplyModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', maxWidth: '550px', width: '100%', padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginTop: 0 }}>Apply for Time Off</h2>
            <TimeOffForm
              onSubmit={handleApplySubmit}
              onCancel={() => setShowApplyModal(false)}
              apiError={formApiError}
            />
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
      <div style={{ border: '1px solid #e0e0e0', borderRadius: '12px', padding: '1.75rem', backgroundColor: '#ffffff' }}>
        <h2 style={{ marginTop: 0, marginBottom: '1.25rem', fontSize: '1.25rem' }}>Request History</h2>

        {loading ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: '#666' }}>Loading requests...</div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#ffe6e6', borderRadius: '8px', color: '#cc0000' }}>
            <p style={{ margin: '0 0 1rem' }}>{error}</p>
            <button
              onClick={fetchMyTimeOffData}
              style={{ padding: '0.5rem 1rem', backgroundColor: '#0066cc', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Retry
            </button>
          </div>
        ) : (
          <TimeOffRequestList
            requests={requests}
            onSelectRequest={(req) => setSelectedRequest(req)}
          />
        )}
      </div>
    </div>
  );
};

export default MyTimeOffPage;
