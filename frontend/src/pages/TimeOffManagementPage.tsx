import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { timeOffService } from '../services/timeoff.service';
import { TimeOffRequestList } from '../components/timeoff/TimeOffRequestList';
import { TimeOffRequestDetails } from '../components/timeoff/TimeOffRequestDetails';
import type { TimeOffRequest, TimeOffStatus } from '../types/timeoff.types';

export const TimeOffManagementPage: React.FC = () => {
  const navigate = useNavigate();

  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    await timeOffService.approveTimeOffRequest(id);
    setSelectedRequest(null);
    fetchAllRequests(); // Refresh list after backend response
  };

  const handleReject = async (id: string) => {
    await timeOffService.rejectTimeOffRequest(id);
    setSelectedRequest(null);
    fetchAllRequests(); // Refresh list after backend response
  };

  // Filter requests dynamically by search query & status filter
  const filteredRequests = requests.filter((req) => {
    // Status filter
    if (statusFilter !== 'ALL' && req.status !== statusFilter) {
      return false;
    }

    // Search query
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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header & Back Link */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <button
            onClick={() => navigate('/admin')}
            style={{ marginBottom: '0.5rem', background: 'none', border: 'none', color: '#0066cc', cursor: 'pointer', textDecoration: 'underline' }}
          >
            ← Back to Admin Dashboard
          </button>
          <h1 style={{ margin: 0 }}>Time Off & Leave Requests</h1>
        </div>

        <button
          onClick={fetchAllRequests}
          style={{
            padding: '0.55rem 1.1rem',
            backgroundColor: '#0066cc',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          🔄 Refresh Requests
        </button>
      </div>

      {/* Control Bar: Search & Status Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem', backgroundColor: '#fff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
        {/* Status Filter Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setStatusFilter('ALL')}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '20px',
              border: '1px solid #ccc',
              backgroundColor: statusFilter === 'ALL' ? '#0066cc' : '#f8f9fa',
              color: statusFilter === 'ALL' ? '#fff' : '#333',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.85rem',
            }}
          >
            All ({requests.length})
          </button>

          <button
            onClick={() => setStatusFilter('PENDING')}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '20px',
              border: '1px solid #ccc',
              backgroundColor: statusFilter === 'PENDING' ? '#b06000' : '#fef7e0',
              color: statusFilter === 'PENDING' ? '#fff' : '#b06000',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
            }}
          >
            Pending ({pendingCount})
          </button>

          <button
            onClick={() => setStatusFilter('APPROVED')}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '20px',
              border: '1px solid #ccc',
              backgroundColor: statusFilter === 'APPROVED' ? '#137333' : '#e6f4ea',
              color: statusFilter === 'APPROVED' ? '#fff' : '#137333',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.85rem',
            }}
          >
            Approved
          </button>

          <button
            onClick={() => setStatusFilter('REJECTED')}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '20px',
              border: '1px solid #ccc',
              backgroundColor: statusFilter === 'REJECTED' ? '#c5221f' : '#fce8e6',
              color: statusFilter === 'REJECTED' ? '#fff' : '#c5221f',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.85rem',
            }}
          >
            Rejected
          </button>
        </div>

        {/* Search Input */}
        <div style={{ flex: 1, minWidth: '250px', maxWidth: '400px' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employee, email, department, type..."
            style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
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
        <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>Loading leave requests...</div>
      ) : error ? (
        <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#ffe6e6', borderRadius: '8px', color: '#cc0000' }}>
          <p style={{ margin: '0 0 1rem' }}>{error}</p>
          <button
            onClick={fetchAllRequests}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#0066cc', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '8px', color: '#777' }}>
          No time-off requests match your filter criteria.
        </div>
      ) : (
        <TimeOffRequestList
          requests={filteredRequests}
          showEmployeeInfo={true}
          onSelectRequest={(req) => setSelectedRequest(req)}
        />
      )}
    </div>
  );
};

export default TimeOffManagementPage;
