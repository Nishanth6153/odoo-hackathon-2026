import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>Loading salary configuration...</div>;
  }

  if (error && !salary) {
    return (
      <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem', textAlign: 'center', backgroundColor: '#ffe6e6', borderRadius: '8px' }}>
        <h2 style={{ color: '#cc0000', marginTop: 0 }}>Unable to Load Salary Information</h2>
        <p>{error}</p>
        <button
          onClick={fetchSalaryData}
          style={{ padding: '0.5rem 1rem', backgroundColor: '#0066cc', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      {/* Navigation & Header */}
      <button
        onClick={() => navigate(`/admin/employees/${id}`)}
        style={{ marginBottom: '1rem', background: 'none', border: 'none', color: '#0066cc', cursor: 'pointer', textDecoration: 'underline' }}
      >
        ← Back to Employee Details
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>Salary & Compensation</h1>
          {employee && (
            <p style={{ margin: '0.25rem 0 0', color: '#666' }}>
              Employee: <strong>{employee.name}</strong> ({employee.designation || 'No Designation'})
            </p>
          )}
        </div>

        <button
          onClick={() => {
            setComponentApiError(null);
            setShowAddComponent(true);
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
          + Add Salary Component
        </button>
      </div>

      {/* Configuration Section: Base Wage & Working Days */}
      <div style={{ border: '1px solid #e0e0e0', borderRadius: '10px', padding: '1.5rem', backgroundColor: '#fff', marginBottom: '2rem' }}>
        <h2 style={{ marginTop: 0, fontSize: '1.2rem', marginBottom: '1rem' }}>Base Salary Configuration</h2>

        {wageSaveSuccess && (
          <div style={{ padding: '0.75rem', backgroundColor: '#e6f4ea', color: '#137333', borderRadius: '4px', marginBottom: '1rem' }}>
            Base salary updated successfully!
          </div>
        )}

        {wageApiError && (
          <div style={{ padding: '0.75rem', backgroundColor: '#ffe6e6', color: '#cc0000', borderRadius: '4px', marginBottom: '1rem' }}>
            {wageApiError}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 500 }}>Monthly Wage (₹) *</label>
            <input
              type="number"
              value={monthlyWageInput}
              onChange={(e) => setMonthlyWageInput(Number(e.target.value))}
              disabled={savingWage}
              style={{ width: '100%', padding: '0.55rem', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 500 }}>Working Days per Month</label>
            <input
              type="number"
              value={workingDaysInput}
              onChange={(e) => setWorkingDaysInput(Number(e.target.value))}
              disabled={savingWage}
              style={{ width: '100%', padding: '0.55rem', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 500 }}>Calculated Yearly Wage</label>
            <div style={{ padding: '0.55rem', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #e0e0e0', fontWeight: 'bold', color: '#222' }}>
              ₹{yearlyWagePreview.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <button
            onClick={handleSaveWage}
            disabled={savingWage}
            style={{
              padding: '0.6rem 1.25rem',
              backgroundColor: savingWage ? '#888' : '#137333',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: savingWage ? 'not-allowed' : 'pointer',
              fontWeight: 500,
            }}
          >
            {savingWage ? 'Saving...' : 'Save Base Wage'}
          </button>
        </div>
      </div>

      {/* Dynamic Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: '#e6f4ea', border: '1px solid #ceebd6', padding: '1.25rem', borderRadius: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: '#137333', fontWeight: 500 }}>Total Earnings</span>
          <strong style={{ display: 'block', fontSize: '1.6rem', color: '#137333', marginTop: '0.25rem' }}>
            ₹{calculatedEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </strong>
        </div>

        <div style={{ backgroundColor: '#fce8e6', border: '1px solid #fad2cf', padding: '1.25rem', borderRadius: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: '#c5221f', fontWeight: 500 }}>Total Deductions</span>
          <strong style={{ display: 'block', fontSize: '1.6rem', color: '#c5221f', marginTop: '0.25rem' }}>
            ₹{calculatedDeductions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </strong>
        </div>

        <div style={{ backgroundColor: '#e8f0fe', border: '1px solid #d2e3fc', padding: '1.25rem', borderRadius: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: '#1a73e8', fontWeight: 500 }}>Net Monthly Salary (Preview)</span>
          <strong style={{ display: 'block', fontSize: '1.6rem', color: '#1a73e8', marginTop: '0.25rem' }}>
            ₹{netMonthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </strong>
        </div>
      </div>

      {/* Modals for Add & Edit Component */}
      {showAddComponent && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', maxWidth: '500px', width: '100%', padding: '1.75rem' }}>
            <h2 style={{ marginTop: 0 }}>Add Salary Component</h2>
            <SalaryComponentForm
              monthlyWage={currentWage}
              onSubmit={handleAddComponentSubmit}
              onCancel={() => setShowAddComponent(false)}
              apiError={componentApiError}
              submitButtonText="Add Component"
            />
          </div>
        </div>
      )}

      {editingComponent && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', maxWidth: '500px', width: '100%', padding: '1.75rem' }}>
            <h2 style={{ marginTop: 0 }}>Edit Salary Component</h2>
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
      )}

      {/* Salary Component List Section */}
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Configured Salary Components</h2>
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
    </div>
  );
};

export default SalaryPage;
