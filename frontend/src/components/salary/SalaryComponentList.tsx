import React from 'react';
import type { SalaryComponent } from '../../types/salary.types';

interface SalaryComponentListProps {
  components: SalaryComponent[];
  monthlyWage: number;
  onEditComponent: (component: SalaryComponent) => void;
  onDeleteComponent: (componentId: string) => void;
  isProcessing?: boolean;
}

export const SalaryComponentList: React.FC<SalaryComponentListProps> = ({
  components,
  monthlyWage,
  onEditComponent,
  onDeleteComponent,
  isProcessing = false,
}) => {
  const earnings = components.filter((c) => c.category === 'EARNING');
  const deductions = components.filter((c) => c.category === 'DEDUCTION');

  const computeAmount = (c: SalaryComponent) => {
    if (c.calculatedAmount !== undefined && c.calculatedAmount !== null) {
      return c.calculatedAmount;
    }
    return c.calculationType === 'PERCENTAGE'
      ? (monthlyWage * c.value) / 100
      : c.value;
  };

  const renderTable = (items: SalaryComponent[], categoryTitle: string, isEarning: boolean) => (
    <div className="card" style={{ marginBottom: 'var(--space-6)', overflow: 'hidden' }}>
      <div
        style={{
          backgroundColor: isEarning ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
          padding: 'var(--space-3) var(--space-5)',
          borderBottom: `1px solid ${isEarning ? 'var(--color-success-border)' : 'var(--color-error-border)'}`,
          fontWeight: 600,
          color: isEarning ? 'var(--color-success-text)' : 'var(--color-error-text)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 'var(--text-sm)',
        }}
      >
        <span>{categoryTitle}</span>
        <span style={{ fontFamily: 'var(--font-mono)' }}>
          Total: ₹{items.reduce((sum, item) => sum + computeAmount(item), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      {items.length === 0 ? (
        <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
          No {categoryTitle.toLowerCase()} configured yet.
        </div>
      ) : (
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Component Name</th>
                <th>Type</th>
                <th>Configured Value</th>
                <th>Calculated Amount</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td>
                    <span className="badge badge-neutral" style={{ fontSize: 'var(--text-xs)' }}>
                      {c.calculationType === 'PERCENTAGE' ? '% Base' : 'Fixed'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>
                    {c.calculationType === 'PERCENTAGE' ? `${c.value}%` : `₹${c.value.toLocaleString()}`}
                  </td>
                  <td style={{ fontWeight: 600, color: isEarning ? 'var(--color-success)' : 'var(--color-error)', fontFamily: 'var(--font-mono)' }}>
                    {isEarning ? '+' : '-'}₹{computeAmount(c).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => onEditComponent(c)}
                        disabled={isProcessing}
                        className="btn btn-outline btn-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete component "${c.name}"?`)) {
                            onDeleteComponent(c.id);
                          }
                        }}
                        disabled={isProcessing}
                        className="btn btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div>
      {renderTable(earnings, 'Earnings & Allowances', true)}
      {renderTable(deductions, 'Deductions & Taxes', false)}
    </div>
  );
};

export default SalaryComponentList;
