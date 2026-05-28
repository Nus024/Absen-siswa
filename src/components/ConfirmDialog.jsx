import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Hapus',
  cancelText = 'Batal',
  isDestructive = true
}) {
  // Tutup dengan Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="modal-scrim confirm-scrim" onClick={onCancel} style={{ zIndex: 9999 }}>
      <div 
        className="modal-panel confirm-panel" 
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="confirm-body">
          {isDestructive && (
            <div className="confirm-icon-wrap">
              <AlertTriangle size={28} className="confirm-icon" />
            </div>
          )}
          <h3 className="confirm-title">{title}</h3>
          <p className="confirm-message">{message}</p>
        </div>
        
        <div className="confirm-actions">
          <button className="btn btn-outline" onClick={onCancel}>
            {cancelText}
          </button>
          <button 
            className={`btn ${isDestructive ? 'btn-destructive' : 'btn-primary'}`} 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
