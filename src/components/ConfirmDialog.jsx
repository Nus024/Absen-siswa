import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle } from 'lucide-react';

export function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Hapus',
  cancelText = 'Batal',
  isDestructive = true,
  isAlertOnly = false,
}) {
  // Tutup dengan Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-scrim" onClick={onCancel}>
      <div
        className="modal-panel"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{ maxWidth: 420 }}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isDestructive && (
              <div style={{
                width: 36, height: 36,
                borderRadius: 10,
                background: '#fef2f2',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <AlertTriangle size={20} color="var(--color-danger)" />
              </div>
            )}
            <h3 className="modal-title">{title}</h3>
          </div>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>

        <div className="modal-divider" />

        {/* Body */}
        <div className="modal-body">
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          {isAlertOnly ? (
            <button
              onClick={onCancel}
              style={{
                height: 38, padding: '0 24px', borderRadius: 8,
                border: 'none',
                background: 'var(--color-primary-500)',
                color: '#fff',
                fontSize: 'var(--text-sm)', fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                transition: 'opacity 150ms ease',
              }}
              onMouseOver={e => e.currentTarget.style.opacity = '0.88'}
              onMouseOut={e => e.currentTarget.style.opacity = '1'}
            >
              Tutup
            </button>
          ) : (
            <>
              <button
                onClick={onCancel}
                style={{
                  height: 38, padding: '0 16px', borderRadius: 8,
                  border: '1px solid var(--border-default)',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--text-sm)', fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  transition: 'background 150ms ease',
                }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--color-neutral-100)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                style={{
                  height: 38, padding: '0 16px', borderRadius: 8,
                  border: 'none',
                  background: isDestructive ? 'var(--color-danger)' : 'var(--color-primary-600)',
                  color: '#fff',
                  fontSize: 'var(--text-sm)', fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  transition: 'opacity 150ms ease',
                }}
                onMouseOver={e => e.currentTarget.style.opacity = '0.88'}
                onMouseOut={e => e.currentTarget.style.opacity = '1'}
              >
                {confirmText}
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
