import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { employeeService } from '../services/employee.service';
import { EmployeeCard } from '../components/employees/EmployeeCard';
import { EmployeeForm, type EmployeeFormData } from '../components/employees/EmployeeForm';
import type { CreateEmployeeResponse, Employee } from '../types/employee.types';

export const EmployeesPage: React.FC = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal / Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [createApiError, setCreateApiError] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<CreateEmployeeResponse | null>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await employeeService.getEmployees();
      setEmployees(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load employees.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleCreateEmployee = async (formData: EmployeeFormData) => {
    try {
      setCreateApiError(null);
      const res = await employeeService.createEmployee({
        name: formData.name,
        email: formData.email,
        password: formData.password || undefined,
        phone: formData.phone,
        department: formData.department,
        designation: formData.designation,
        joiningDate: formData.joiningDate,
      });

      setCreatedResult(res);
      setShowAddForm(false);
      fetchEmployees(); // Refresh list
    } catch (err: unknown) {
      if (err instanceof Error) {
        setCreateApiError(err.message);
      } else {
        setCreateApiError('An error occurred while creating employee.');
      }
    }
  };

  // Dynamic search filter over name, email, department, designation, loginId
  const filteredEmployees = employees.filter((emp) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      emp.name?.toLowerCase().includes(q) ||
      emp.email?.toLowerCase().includes(q) ||
      emp.department?.toLowerCase().includes(q) ||
      emp.designation?.toLowerCase().includes(q) ||
      emp.loginId?.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <Navbar portalTitle="Administration" />

      <main className="page-container">
        {/* Header */}
        <div className="page-header">
          <div className="page-title-group">
            <button
              onClick={() => navigate('/admin')}
              className="back-link"
            >
              ← Back to Dashboard
            </button>
            <h1>Employees Directory</h1>
            <p>Manage employee records, organizational departments, and profiles</p>
          </div>

          <button
            onClick={() => {
              setCreatedResult(null);
              setCreateApiError(null);
              setShowAddForm(true);
            }}
            className="btn btn-primary"
          >
            + Add Employee
          </button>
        </div>

        {/* Created Alert Banner */}
        {createdResult && (createdResult.loginId || createdResult.tempPassword) && (
          <div className="alert alert-success" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>Employee Account Created: </strong>
              <span>Login Email/ID: <strong style={{ fontFamily: 'var(--font-mono)' }}>{createdResult.loginId}</strong> | Temp Password: <strong style={{ fontFamily: 'var(--font-mono)' }}>{createdResult.tempPassword}</strong></span>
            </div>
            <button
              onClick={() => setCreatedResult(null)}
              className="btn btn-sm btn-secondary"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employees by name, email, department, designation, or ID..."
            className="form-input"
            style={{ padding: '0.75rem 1rem', fontSize: 'var(--text-base)' }}
          />
        </div>

        {/* Add Employee Modal */}
        {showAddForm && (
          <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
            <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="modal-dialog-header">
                <h2 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)' }}>
                  Add New Employee
                </h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  style={{ background: 'none', border: 'none', fontSize: 'var(--text-xl)', cursor: 'pointer', color: 'var(--color-text-muted)', lineHeight: 1 }}
                >
                  ×
                </button>
              </div>

              <div className="modal-dialog-body">
                <EmployeeForm
                  onSubmit={handleCreateEmployee}
                  onCancel={() => setShowAddForm(false)}
                  submitButtonText="Create Employee"
                  apiError={createApiError}
                />
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        {loading ? (
          <div className="loading-box">
            <div className="spinner" />
            <span>Loading employee directory...</span>
          </div>
        ) : error ? (
          <div className="alert alert-error" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{error}</span>
            <button onClick={fetchEmployees} className="btn btn-sm btn-danger">
              Retry
            </button>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <div className="empty-state-title">No Employees Found</div>
            <p className="empty-state-desc">
              {searchQuery ? 'No employees matched your search query.' : 'No employee records are present in the system.'}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 'var(--space-5)',
            }}
          >
            {filteredEmployees.map((emp) => (
              <EmployeeCard key={emp.id} employee={emp} />
            ))}
          </div>
        )}
      </main>
    </>
  );
};

export default EmployeesPage;
