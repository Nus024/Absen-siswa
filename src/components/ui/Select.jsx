import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function Select({ value, onChange, options, style }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value) || options[0];

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block', minWidth: 140, ...style }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          width: '100%',
          height: '38px',
          padding: '0 12px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: '8px',
          fontSize: 'var(--text-sm)',
          color: 'var(--text-primary)',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 150ms ease',
          outline: 'none',
        }}
      >
        <span>{selectedOption?.label}</span>
        <ChevronDown size={16} style={{ color: 'var(--text-secondary)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          zIndex: 150,
          minWidth: '100%',
          width: 'max-content',
          maxHeight: '240px',
          overflowY: 'auto',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: '8px',
          boxShadow: 'var(--shadow-lg)',
          padding: '4px',
        }}>
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '8px 12px',
                border: 'none',
                background: opt.value === value ? 'var(--color-primary-50)' : 'transparent',
                color: opt.value === value ? 'var(--color-primary-700)' : 'var(--text-primary)',
                fontSize: 'var(--text-sm)',
                fontWeight: opt.value === value ? 600 : 400,
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'background 100ms',
              }}
              onMouseOver={e => {
                if (opt.value !== value) e.currentTarget.style.background = 'var(--color-neutral-100)';
              }}
              onMouseOut={e => {
                if (opt.value !== value) e.currentTarget.style.background = 'transparent';
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
