import React, { useState } from 'react';

interface TagListInputProps {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}

export const TagListInput: React.FC<TagListInputProps> = ({ label, items = [], onChange, placeholder = 'Add item...' }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !items.includes(trimmed)) {
      onChange([...items, trimmed]);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>

      {items.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
          {items.map((item, index) => (
            <span
              key={index}
              className="badge badge-info"
              style={{ padding: '4px 8px', fontSize: 'var(--text-xs)' }}
            >
              {item}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  fontSize: 'var(--text-sm)',
                  padding: 0,
                  marginLeft: '4px',
                  lineHeight: 1,
                  fontWeight: 'bold',
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="form-input"
          style={{ flex: 1 }}
        />
        <button
          type="button"
          onClick={handleAdd}
          className="btn btn-secondary btn-sm"
        >
          + Add
        </button>
      </div>
    </div>
  );
};

export default TagListInput;
