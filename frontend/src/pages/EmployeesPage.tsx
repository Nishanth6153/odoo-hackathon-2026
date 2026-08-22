import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      {/* Header with Nav back to Dashboard and Add Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <button
            onClick={() => navigate('/admin')}
            style={{ marginBottom: '0.5rem', background: 'none', border: 'none', color: '#0066cc', cursor: 'pointer', textDecoration: 'underline' }}
          >
            ← Back to Admin Dashboard
          </button>
          <h1 style={{ margin: 0 }}>Employees Directory</h1>
        </div>

        <button
          onClick={() => {
            setCreatedResult(null);
            setCreateApiError(null);
            setShowAddForm(true);
          }}
          style={{
            padding: '0.6rem 1.25rem',
            backgroundColor: '#0066cc',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          + Add Employee
        </button>
      </div>

      {/* Generated Credentials Alert Banner if recently created */}
      {createdResult && (createdResult.loginId || createdResult.tempPassword) && (
        <div style={{ padding: '1rem', backgroundColor: '#e6f4ea', border: '1px solid #34a853', borderRadius: '6px', marginBottom: '1.5rem' }}>
          <h4 style={{ margin: '0 0 0.5rem', color: '#137333' }}>Employee Created Successfully</h4>
          {createdResult.loginId && <div><strong>Login ID:</strong> {createdResult.loginId}</div>}
          {createdResult.tempPassword && <div><strong>Temporary Password:</strong> {createdResult.tempPassword}</div>}
          <button
            onClick={() => setCreatedResult(null)}
            style={{ marginTop: '0.5rem', fontSize: '0.8rem', padding: '0.2rem 0.5rem', cursor: 'pointer' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, email, department, designation, or login ID..."
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            fontSize: '1rem',
            borderRadius: '6px',
            border: '1px solid #ccc',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Add Employee Modal / Drawer */}
      {showAddForm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', maxWidth: '550px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginTop: 0 }}>Add New Employee</h2>
            <EmployeeForm
              onSubmit={handleCreateEmployee}
              onCancel={() => setShowAddForm(false)}
              submitButtonText="Create Employee"
              apiError={createApiError}
            />
          </div>
        </div>
      )}

      {/* Main Content Area: Loading / Error / Empty / Grid */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>Loading employees...</div>
      ) : error ? (
        <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#ffe6e6', borderRadius: '8px', color: '#cc0000' }}>
          <p style={{ margin: '0 0 1rem' }}>{error}</p>
          <button
            onClick={fetchEmployees}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#0066cc', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#777', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
          {searchQuery ? 'No employees match your search criteria.' : 'No employees found.'}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {filteredEmployees.map((emp) => (
            <EmployeeCard key={emp.id} employee={emp} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeesPage;
