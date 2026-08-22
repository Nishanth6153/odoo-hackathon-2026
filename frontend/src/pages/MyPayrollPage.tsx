import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
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
    <>
      <Navbar portalTitle="Employee Workspace" />

      <main className="page-container" style={{ maxWidth: '960px' }}>
        {/* Navigation & Header */}
        <div className="page-header">
          <div className="page-title-group">
            <button
              onClick={() => navigate('/employee')}
              className="back-link"
            >
              ← Back to Dashboard
            </button>
            <h1>My Payroll & Compensation</h1>
            <p>View your monthly compensation package, allowances, and statutory deduction details</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-box">
            <div className="spinner" />
            <span>Loading salary details...</span>
          </div>
        ) : error ? (
          <div className="empty-state">
            <div className="empty-state-icon">💰</div>
            <div className="empty-state-title">Salary Record Pending</div>
            <p className="empty-state-desc">
              {error} Salary structure may not have been configured yet. Please consult your HR administrator.
            </p>
          </div>
        ) : salary ? (
          <>
            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
              <div className="stat-card">
                <span className="stat-label">Base Wage</span>
                <div className="stat-value" style={{ color: 'var(--color-primary)' }}>
                  {fmt(salary.monthlyWage)}
                </div>
                <span className="stat-subtext">Monthly base wage</span>
              </div>

              <div className="stat-card">
                <span className="stat-label">Total Earnings</span>
                <div className="stat-value" style={{ color: 'var(--color-success)' }}>
                  {fmt(salary.totalEarnings)}
                </div>
                <span className="stat-subtext">Allowances & gross additions</span>
              </div>

              <div className="stat-card">
                <span className="stat-label">Total Deductions</span>
                <div className="stat-value" style={{ color: 'var(--color-error)' }}>
                  {fmt(salary.totalDeductions)}
                </div>
                <span className="stat-subtext">Tax & deductions</span>
              </div>

              <div className="stat-card">
                <span className="stat-label">Net Monthly Salary</span>
                <div className="stat-value" style={{ color: 'var(--color-purple)' }}>
                  {fmt(salary.netMonthlyAmount)}
                </div>
                <span className="stat-subtext">Estimated net pay</span>
              </div>
            </div>

            {/* Salary Components Breakdown */}
            {salary.components.length > 0 && (
              <div className="card card-padding">
                <h2 style={{ margin: '0 0 var(--space-5)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
                  Salary Structure Breakdown
                </h2>

                {/* Earnings */}
                {salary.components.filter(c => c.category === 'EARNING').length > 0 && (
                  <div style={{ marginBottom: 'var(--space-6)' }}>
                    <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--color-success)', marginBottom: 'var(--space-3)' }}>
                      Earnings & Allowances
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                      {salary.components.filter(c => c.category === 'EARNING').map(comp => (
                        <div
                          key={comp.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 'var(--space-3) var(--space-4)',
                            backgroundColor: 'var(--color-bg-subtle)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-border)',
                          }}
                        >
                          <div>
                            <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>{comp.name}</strong>
                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginLeft: 'var(--space-2)' }}>
                              ({comp.calculationType === 'PERCENTAGE' ? `${comp.value}% of base` : 'Fixed'})
                            </span>
                          </div>
                          <strong style={{ color: 'var(--color-success)', fontFamily: 'var(--font-mono)' }}>+{fmt(comp.calculatedAmount || 0)}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Deductions */}
                {salary.components.filter(c => c.category === 'DEDUCTION').length > 0 && (
                  <div>
                    <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--color-error)', marginBottom: 'var(--space-3)' }}>
                      Deductions & Statutory Taxes
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                      {salary.components.filter(c => c.category === 'DEDUCTION').map(comp => (
                        <div
                          key={comp.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 'var(--space-3) var(--space-4)',
                            backgroundColor: 'var(--color-bg-subtle)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-border)',
                          }}
                        >
                          <div>
                            <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>{comp.name}</strong>
                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginLeft: 'var(--space-2)' }}>
                              ({comp.calculationType === 'PERCENTAGE' ? `${comp.value}% of base` : 'Fixed'})
                            </span>
                          </div>
                          <strong style={{ color: 'var(--color-error)', fontFamily: 'var(--font-mono)' }}>-{fmt(comp.calculatedAmount || 0)}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : null}
      </main>
    </>
  );
};

export default MyPayrollPage;
