import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { salaryService } from '../services/salary.service';
import { employeeService } from '../services/employee.service';
import { SalaryComponentList } from '../components/salary/SalaryComponentList';
import { SalaryComponentForm, type SalaryComponentFormData } from '../components/salary/SalaryComponentForm';
import type { SalaryComponent, SalaryStructure } from '../types/salary.types';
import type { EmployeeProfile } from '../types/employee.types';

export const SalaryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
  const [salary, setSalary] = useState<SalaryStructure | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Configuration Form State
  const [monthlyWageInput, setMonthlyWageInput] = useState<number>(0);
  const [workingDaysInput, setWorkingDaysInput] = useState<number>(22);
  const [savingWage, setSavingWage] = useState(false);
  const [wageApiError, setWageApiError] = useState<string | null>(null);
  const [wageSaveSuccess, setWageSaveSuccess] = useState(false);

  // Component Modals
  const [showAddComponent, setShowAddComponent] = useState(false);
  const [editingComponent, setEditingComponent] = useState<SalaryComponent | null>(null);
  const [componentApiError, setComponentApiError] = useState<string | null>(null);
  const [isProcessingComponent, setIsProcessingComponent] = useState(false);

  const fetchSalaryData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);

      const [empData, salaryData] = await Promise.all([
        employeeService.getEmployeeById(id).catch(() => null),
        salaryService.getSalary(id),
      ]);

      setEmployee(empData);
      setSalary(salaryData);
      setMonthlyWageInput(salaryData.monthlyWage || 0);
      setWorkingDaysInput(salaryData.workingDays || 22);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load salary configuration.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaryData();
  }, [id]);

  const handleSaveWage = async () => {
    if (!id) return;
    if (monthlyWageInput <= 0) {
      setWageApiError('Monthly wage must be greater than 0.');
      return;
    }

    try {
      setSavingWage(true);
      setWageApiError(null);
      setWageSaveSuccess(false);

      const updated = await salaryService.updateSalary(id, {
        monthlyWage: Number(monthlyWageInput),
        workingDays: Number(workingDaysInput),
      });

      setSalary(updated);
      setWageSaveSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setWageApiError(err.message);
      } else {
        setWageApiError('Failed to save salary configuration.');
      }
    } finally {
      setSavingWage(false);
    }
  };

  const handleAddComponentSubmit = async (formData: SalaryComponentFormData) => {
    if (!id) return;
    try {
      setIsProcessingComponent(true);
      setComponentApiError(null);

      const updated = await salaryService.addSalaryComponent(id, formData);
      setSalary(updated);
      setShowAddComponent(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setComponentApiError(err.message);
      } else {
        setComponentApiError('Failed to add component.');
      }
    } finally {
      setIsProcessingComponent(false);
    }
  };

  const handleEditComponentSubmit = async (formData: SalaryComponentFormData) => {
    if (!editingComponent) return;
    try {
      setIsProcessingComponent(true);
      setComponentApiError(null);

      const updated = await salaryService.updateSalaryComponent(editingComponent.id, formData);
      setSalary(updated);
      setEditingComponent(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setComponentApiError(err.message);
      } else {
        setComponentApiError('Failed to update component.');
      }
    } finally {
      setIsProcessingComponent(false);
    }
  };

  const handleDeleteComponent = async (componentId: string) => {
    try {
      setIsProcessingComponent(true);
      await salaryService.deleteSalaryComponent(componentId);
      fetchSalaryData(); // Refresh salary structure
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      }
    } finally {
      setIsProcessingComponent(false);
    }
  };

  // Dynamic Preview Calculations
  const currentWage = Number(monthlyWageInput) || 0;
  const currentComponents = salary?.components || [];

  const calculatedEarnings = currentComponents
    .filter((c) => c.category === 'EARNING')
    .reduce((sum, c) => {
      const amt = c.calculatedAmount !== undefined ? c.calculatedAmount : c.calculationType === 'PERCENTAGE' ? (currentWage * c.value) / 100 : c.value;
      return sum + amt;
    }, 0);

  const calculatedDeductions = currentComponents
    .filter((c) => c.category === 'DEDUCTION')
    .reduce((sum, c) => {
      const amt = c.calculatedAmount !== undefined ? c.calculatedAmount : c.calculationType === 'PERCENTAGE' ? (currentWage * c.value) / 100 : c.value;
      return sum + amt;
    }, 0);

  const netMonthly = salary?.netMonthlyAmount !== undefined
    ? salary.netMonthlyAmount
    : calculatedEarnings - calculatedDeductions;

  const yearlyWagePreview = currentWage * 12;

  return (
    <>
      <Navbar portalTitle="Administration" />

      <main className="page-container">
        {/* Navigation & Header */}
        <div className="page-header">
          <div className="page-title-group">
            <button
              onClick={() => navigate(`/admin/employees/${id}`)}
              className="back-link"
            >
              ← Back to Employee Profile
            </button>
            <h1>Salary & Compensation</h1>
            {employee && (
              <p>
                Configure salary components for <strong>{employee.name}</strong> ({employee.designation || 'Staff'})
              </p>
            )}
          </div>

          <button
            onClick={() => {
              setComponentApiError(null);
              setShowAddComponent(true);
            }}
            className="btn btn-primary"
          >
            + Add Salary Component
          </button>
        </div>

        {/* Loading / Error state */}
        {loading ? (
          <div className="loading-box">
            <div className="spinner" />
            <span>Loading salary details...</span>
          </div>
        ) : error && !salary ? (
          <div className="empty-state">
            <div className="empty-state-icon">❌</div>
            <div className="empty-state-title">Salary Information Unavailable</div>
            <p className="empty-state-desc">{error}</p>
            <button onClick={fetchSalaryData} className="btn btn-primary btn-sm" style={{ marginTop: 'var(--space-4)' }}>
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Configuration Section: Base Wage & Working Days */}
            <div className="card card-padding" style={{ marginBottom: 'var(--space-6)' }}>
              <h2 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-4)', color: 'var(--color-text-primary)' }}>
                Base Salary Configuration
              </h2>

              {wageSaveSuccess && (
                <div className="alert alert-success" style={{ marginBottom: 'var(--space-4)' }}>
                  <span>✓ Base salary configuration updated successfully.</span>
                </div>
              )}

              {wageApiError && (
                <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
                  <span>⚠️ {wageApiError}</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', alignItems: 'end' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Monthly Wage (₹) *</label>
                  <input
                    type="number"
                    value={monthlyWageInput}
                    onChange={(e) => setMonthlyWageInput(Number(e.target.value))}
                    disabled={savingWage}
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Working Days / Month</label>
                  <input
                    type="number"
                    value={workingDaysInput}
                    onChange={(e) => setWorkingDaysInput(Number(e.target.value))}
                    disabled={savingWage}
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Calculated Yearly CTC</label>
                  <div style={{ padding: '0.55rem 0.85rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>
                    ₹{yearlyWagePreview.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                <button
                  onClick={handleSaveWage}
                  disabled={savingWage}
                  className="btn btn-success"
                >
                  {savingWage ? 'Saving...' : 'Save Base Wage'}
                </button>
              </div>
            </div>

            {/* Dynamic Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
              <div className="stat-card">
                <span className="stat-label">Total Earnings</span>
                <div className="stat-value" style={{ color: 'var(--color-success)' }}>
                  ₹{calculatedEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <span className="stat-subtext">Allowances & gross additions</span>
              </div>

              <div className="stat-card">
                <span className="stat-label">Total Deductions</span>
                <div className="stat-value" style={{ color: 'var(--color-error)' }}>
                  ₹{calculatedDeductions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <span className="stat-subtext">Tax, PF, and deductions</span>
              </div>

              <div className="stat-card">
                <span className="stat-label">Net Monthly Salary</span>
                <div className="stat-value" style={{ color: 'var(--color-primary)' }}>
                  ₹{netMonthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <span className="stat-subtext">Take-home monthly estimate</span>
              </div>
            </div>

            {/* Modals for Add & Edit Component */}
            {showAddComponent && (
              <div className="modal-overlay" onClick={() => setShowAddComponent(false)}>
                <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-dialog-header">
                    <h2 style={{ margin: 0, fontSize: 'var(--text-lg)' }}>Add Salary Component</h2>
                    <button
                      onClick={() => setShowAddComponent(false)}
                      style={{ background: 'none', border: 'none', fontSize: 'var(--text-xl)', cursor: 'pointer', color: 'var(--color-text-muted)', lineHeight: 1 }}
                    >
                      ×
                    </button>
                  </div>
                  <div className="modal-dialog-body">
                    <SalaryComponentForm
                      monthlyWage={currentWage}
                      onSubmit={handleAddComponentSubmit}
                      onCancel={() => setShowAddComponent(false)}
                      apiError={componentApiError}
                      submitButtonText="Add Component"
                    />
                  </div>
                </div>
              </div>
            )}

            {editingComponent && (
              <div className="modal-overlay" onClick={() => setEditingComponent(null)}>
                <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-dialog-header">
                    <h2 style={{ margin: 0, fontSize: 'var(--text-lg)' }}>Edit Salary Component</h2>
                    <button
                      onClick={() => setEditingComponent(null)}
                      style={{ background: 'none', border: 'none', fontSize: 'var(--text-xl)', cursor: 'pointer', color: 'var(--color-text-muted)', lineHeight: 1 }}
                    >
                      ×
                    </button>
                  </div>
                  <div className="modal-dialog-body">
                    <SalaryComponentForm
                      initialValues={editingComponent}
                      monthlyWage={currentWage}
                      onSubmit={handleEditComponentSubmit}
                      onCancel={() => setEditingComponent(null)}
                      apiError={componentApiError}
                      submitButtonText="Update Component"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Salary Component List Section */}
            <h2 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-4)', color: 'var(--color-text-primary)' }}>
              Configured Components
            </h2>
            <SalaryComponentList
              components={currentComponents}
              monthlyWage={currentWage}
              onEditComponent={(comp) => {
                setComponentApiError(null);
                setEditingComponent(comp);
              }}
              onDeleteComponent={handleDeleteComponent}
              isProcessing={isProcessingComponent}
            />
          </>
        )}
      </main>
    </>
  );
};

export default SalaryPage;
