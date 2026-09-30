import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger' | 'warning' | 'primary'
  requireReason = false,
  reasonPlaceholder = 'Please enter a reason...',
  loading = false
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) {
      setError('Please provide a reason before continuing.');
      return;
    }
    setError('');
    onConfirm(requireReason ? reason.trim() : true);
  };

  const handleClose = () => {
    setReason('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="sm" showCloseBtn={!loading}>
      <div className="kb-confirm-dialog">
        <div className={`kb-confirm-icon-box kb-confirm-${variant}`}>
          {variant === 'danger' && <AlertTriangle size={24} />}
          {variant === 'warning' && <AlertCircle size={24} />}
          {variant === 'primary' && <CheckCircle size={24} />}
        </div>

        <h3 className="kb-confirm-title">{title}</h3>
        <p className="kb-confirm-message">{message}</p>

        {requireReason && (
          <div className="kb-confirm-reason-box">
            <textarea
              className="kb-confirm-textarea"
              placeholder={reasonPlaceholder}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              rows={3}
              autoFocus
            />
            {error && <p className="kb-confirm-error">{error}</p>}
          </div>
        )}

        <div className="kb-confirm-actions">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'primary' ? 'primary' : 'danger'}
            onClick={handleConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
