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
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>{label}</label>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
        {items.map((item, index) => (
          <span
            key={index}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: '#eef2f6',
              border: '1px solid #cfd8dc',
              padding: '0.25rem 0.6rem',
              borderRadius: '16px',
              fontSize: '0.875rem',
              color: '#333',
            }}
          >
            {item}
            <button
              type="button"
              onClick={() => handleRemove(index)}
              style={{
                background: 'none',
                border: 'none',
                color: '#666',
                cursor: 'pointer',
                fontSize: '0.875rem',
                padding: '0 2px',
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={{ flex: 1, padding: '0.4rem 0.6rem', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button
          type="button"
          onClick={handleAdd}
          style={{
            padding: '0.4rem 0.8rem',
            backgroundColor: '#0066cc',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          + Add
        </button>
      </div>
    </div>
  );
};
