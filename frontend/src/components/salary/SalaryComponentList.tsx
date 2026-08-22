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
    <div style={{ marginBottom: '1.5rem', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#fff' }}>
      <div style={{ backgroundColor: isEarning ? '#e6f4ea' : '#fce8e6', padding: '0.75rem 1rem', borderBottom: '1px solid #e0e0e0', fontWeight: 'bold', color: isEarning ? '#137333' : '#c5221f', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{categoryTitle}</span>
        <span style={{ fontSize: '0.85rem' }}>
          Total: ₹{items.reduce((sum, item) => sum + computeAmount(item), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      {items.length === 0 ? (
        <div style={{ padding: '1.5rem', textAlign: 'center', color: '#888', fontSize: '0.9rem' }}>
          No {categoryTitle.toLowerCase()} configured yet.
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #e0e0e0', color: '#555' }}>
              <th style={{ padding: '0.65rem 1rem' }}>Component Name</th>
              <th style={{ padding: '0.65rem 1rem' }}>Type</th>
              <th style={{ padding: '0.65rem 1rem' }}>Configured Value</th>
              <th style={{ padding: '0.65rem 1rem' }}>Calculated Amount (Monthly)</th>
              <th style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '0.75rem 1rem', fontWeight: 500, color: '#222' }}>{c.name}</td>
                <td style={{ padding: '0.75rem 1rem', color: '#555' }}>
                  <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: '#f0f0f0', fontWeight: 500 }}>
                    {c.calculationType === 'PERCENTAGE' ? 'Percentage' : 'Fixed'}
                  </span>
                </td>
                <td style={{ padding: '0.75rem 1rem', color: '#333' }}>
                  {c.calculationType === 'PERCENTAGE' ? `${c.value}%` : `₹${c.value.toLocaleString()}`}
                </td>
                <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: isEarning ? '#137333' : '#c5221f' }}>
                  ₹{computeAmount(c).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => onEditComponent(c)}
                      disabled={isProcessing}
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem', backgroundColor: '#eef2f6', color: '#0066cc', border: '1px solid #0066cc', borderRadius: '4px', cursor: 'pointer' }}
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
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem', backgroundColor: '#ffe6e6', color: '#cc0000', border: '1px solid #cc0000', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div>
      {renderTable(earnings, 'Earnings', true)}
      {renderTable(deductions, 'Deductions', false)}
    </div>
  );
};
