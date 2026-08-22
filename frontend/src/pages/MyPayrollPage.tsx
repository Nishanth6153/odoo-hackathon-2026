import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { salaryService } from '../services/salary.service';
import type { SalaryStructure } from '../types/salary.types';

export const MyPayrollPage: React.FC = () => {
  const navigate = useNavigate();
  const [salary, setSalary] = useState<SalaryStructure | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSalary = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await salaryService.getMySalary();
        setSalary(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to load salary information.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSalary();
  }, []);

  const fmt = (v?: number) =>
    `₹${(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <button
        onClick={() => navigate('/employee')}
        style={{ marginBottom: '1rem', background: 'none', border: 'none', color: '#0066cc', cursor: 'pointer', textDecoration: 'underline' }}
      >
        ← Back to Employee Dashboard
      </button>

      <h1 style={{ marginTop: 0, marginBottom: '1.5rem' }}>My Payroll & Compensation</h1>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>Loading salary information...</div>
      ) : error ? (
        <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#ffe6e6', borderRadius: '8px', color: '#cc0000' }}>
          <p style={{ margin: '0 0 0.5rem' }}>{error}</p>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#666' }}>
            Salary information may not have been configured yet. Please contact HR/Admin.
          </p>
        </div>
      ) : salary ? (
        <>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', padding: '1.25rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: '#0369a1', fontWeight: 500 }}>Base Salary</span>
              <strong style={{ display: 'block', fontSize: '1.5rem', color: '#0c4a6e', marginTop: '0.25rem' }}>
                {fmt(salary.monthlyWage)}
              </strong>
            </div>

            <div style={{ backgroundColor: '#e6f4ea', border: '1px solid #ceebd6', padding: '1.25rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: '#137333', fontWeight: 500 }}>Total Earnings</span>
              <strong style={{ display: 'block', fontSize: '1.5rem', color: '#137333', marginTop: '0.25rem' }}>
                {fmt(salary.totalEarnings)}
              </strong>
            </div>

            <div style={{ backgroundColor: '#fce8e6', border: '1px solid #fad2cf', padding: '1.25rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: '#c5221f', fontWeight: 500 }}>Total Deductions</span>
              <strong style={{ display: 'block', fontSize: '1.5rem', color: '#c5221f', marginTop: '0.25rem' }}>
                {fmt(salary.totalDeductions)}
              </strong>
            </div>

            <div style={{ backgroundColor: '#e8f0fe', border: '1px solid #d2e3fc', padding: '1.25rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: '#1a73e8', fontWeight: 500 }}>Net Monthly Salary</span>
              <strong style={{ display: 'block', fontSize: '1.5rem', color: '#1a73e8', marginTop: '0.25rem' }}>
                {fmt(salary.netMonthlyAmount)}
              </strong>
            </div>
          </div>

          {/* Salary Components Breakdown */}
          {salary.components.length > 0 && (
            <div style={{ border: '1px solid #e0e0e0', borderRadius: '10px', padding: '1.5rem', backgroundColor: '#fff' }}>
              <h2 style={{ marginTop: 0, fontSize: '1.2rem', marginBottom: '1rem' }}>Salary Components</h2>

              {/* Earnings */}
              {salary.components.filter(c => c.category === 'EARNING').length > 0 && (
                <>
                  <h3 style={{ fontSize: '1rem', color: '#137333', marginBottom: '0.75rem' }}>Earnings</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    {salary.components.filter(c => c.category === 'EARNING').map(comp => (
                      <div key={comp.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#f8faf8', borderRadius: '6px', border: '1px solid #e9ecef' }}>
                        <div>
                          <strong>{comp.name}</strong>
                          <span style={{ fontSize: '0.8rem', color: '#888', marginLeft: '0.5rem' }}>
                            ({comp.calculationType === 'PERCENTAGE' ? `${comp.value}% of base` : 'Fixed'})
                          </span>
                        </div>
                        <strong style={{ color: '#137333' }}>{fmt(comp.calculatedAmount || 0)}</strong>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Deductions */}
              {salary.components.filter(c => c.category === 'DEDUCTION').length > 0 && (
                <>
                  <h3 style={{ fontSize: '1rem', color: '#c5221f', marginBottom: '0.75rem' }}>Deductions</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {salary.components.filter(c => c.category === 'DEDUCTION').map(comp => (
                      <div key={comp.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#fef8f8', borderRadius: '6px', border: '1px solid #e9ecef' }}>
                        <div>
                          <strong>{comp.name}</strong>
                          <span style={{ fontSize: '0.8rem', color: '#888', marginLeft: '0.5rem' }}>
                            ({comp.calculationType === 'PERCENTAGE' ? `${comp.value}% of base` : 'Fixed'})
                          </span>
                        </div>
                        <strong style={{ color: '#c5221f' }}>-{fmt(comp.calculatedAmount || 0)}</strong>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};

export default MyPayrollPage;
