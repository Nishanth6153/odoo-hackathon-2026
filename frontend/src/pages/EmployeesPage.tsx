import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeService } from '../services/employee.service';
import { EmployeeForm, type EmployeeFormData } from '../components/employees/EmployeeForm';
import { PageTransition } from '../components/motion/PageTransition';
import { Reveal } from '../components/motion/Reveal';
import { CardInteraction } from '../components/motion/CardInteraction';
import type { Employee } from '../types/employee.types';

export const EmployeesPage: React.FC = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ loginId?: string; tempPassword?: string } | null>(null);

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
        setError('Unable to load employees.');
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
      setError(null);
      const result = await employeeService.createEmployee(formData);

      if (result.loginId || result.tempPassword) {
        setCreatedCredentials({
          loginId: result.loginId,
          tempPassword: result.tempPassword,
        });
      } else {
        setShowAddModal(false);
      }

      fetchEmployees();
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw err;
      }
      throw new Error('Failed to create employee');
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const q = searchQuery.toLowerCase();
    return (
      emp.name.toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q) ||
      (emp.department && emp.department.toLowerCase().includes(q)) ||
      (emp.designation && emp.designation.toLowerCase().includes(q))
    );
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(Boolean)
      .map((p) => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <PageTransition>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
        <button
          onClick={() => navigate('/admin')}
          style={{ marginBottom: '1rem', background: 'none', border: 'none', color: '#0066cc', cursor: 'pointer', textDecoration: 'underline' }}
        >
          ← Back to Admin Dashboard
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ margin: 0 }}>Employees Directory</h1>
            <p style={{ margin: '0.25rem 0 0', color: '#666' }}>Manage organization workforce profiles and access credentials</p>
          </div>

          <button
            onClick={() => {
              setCreatedCredentials(null);
              setShowAddModal(true);
            }}
            style={{
              padding: '0.65rem 1.25rem',
              backgroundColor: '#0066cc',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.95rem',
            }}
          >
            + Add New Employee
          </button>
        </div>

        {/* Search Bar */}
        <Reveal delay={0.1}>
          <div style={{ marginBottom: '1.5rem' }}>
            <input
              type="text"
              placeholder="🔍 Search by name, email, department, or designation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid #ccc',
                fontSize: '1rem',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </Reveal>

        {error && (
          <div style={{ padding: '1rem', backgroundColor: '#ffe6e6', color: '#cc0000', borderRadius: '6px', marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {/* Employees Cards Grid */}
        <Reveal delay={0.2}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>Loading employees directory...</div>
          ) : filteredEmployees.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px dashed #ccc' }}>
              <p style={{ margin: 0, color: '#666' }}>No employees found matching your search.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {filteredEmployees.map((emp) => (
                <CardInteraction key={emp.id} onClick={() => navigate(`/admin/employees/${emp.id}`)}>
                  <div style={{ border: '1px solid #e0e0e0', borderRadius: '10px', padding: '1.25rem', backgroundColor: '#fff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                      {emp.profileImage ? (
                        <img
                          src={emp.profileImage}
                          alt={emp.name}
                          style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            backgroundColor: '#0066cc',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '1.1rem',
                          }}
                        >
                          {getInitials(emp.name)}
                        </div>
                      )}

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {emp.name}
                        </h3>
                        <p style={{ margin: '0.1rem 0 0', fontSize: '0.85rem', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {emp.designation || 'No Designation'}
                        </p>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: '#444', display: 'flex', flexDirection: 'column', gap: '0.25rem', borderTop: '1px solid #f0f0f0', paddingTop: '0.75rem' }}>
                      <div><strong>Dept:</strong> {emp.department || 'N/A'}</div>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><strong>Email:</strong> {emp.email}</div>
                    </div>
                  </div>
                </CardInteraction>
              ))}
            </div>
          )}
        </Reveal>

        {/* Add Employee Modal */}
        {showAddModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '1rem',
            }}
          >
            <div
              style={{
                backgroundColor: '#fff',
                borderRadius: '8px',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '1.75rem',
              }}
            >
              {createdCredentials ? (
                <div>
                  <h2 style={{ color: '#137333', marginTop: 0 }}>✅ Employee Created Successfully</h2>
                  <p>Please share these generated login credentials with the employee:</p>

                  <div style={{ backgroundColor: '#f0f4f8', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem' }}>
                    <p style={{ margin: '0.25rem 0' }}><strong>Login ID:</strong> {createdCredentials.loginId}</p>
                    {createdCredentials.tempPassword && (
                      <p style={{ margin: '0.25rem 0' }}><strong>Temporary Password:</strong> {createdCredentials.tempPassword}</p>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setCreatedCredentials(null);
                      setShowAddModal(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      backgroundColor: '#0066cc',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div>
                  <h2 style={{ marginTop: 0 }}>Add New Employee</h2>
                  <EmployeeForm
                    onSubmit={handleCreateEmployee}
                    onCancel={() => setShowAddModal(false)}
                    submitButtonText="Create Employee"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default EmployeesPage;
