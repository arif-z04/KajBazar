import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  showCloseBtn = true,
  className = ''
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="kb-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={`kb-modal-content kb-modal-${maxWidth} ${className}`.trim()}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseBtn) && (
          <div className="kb-modal-header">
            <div>
              {title && <h3 className="kb-modal-title">{title}</h3>}
              {subtitle && <p className="kb-modal-subtitle">{subtitle}</p>}
            </div>
            {showCloseBtn && (
              <button
                type="button"
                className="kb-modal-close-btn"
                onClick={onClose}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}
        <div className="kb-modal-body">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
