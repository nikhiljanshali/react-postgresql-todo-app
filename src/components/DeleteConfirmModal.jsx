import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, todo }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !todo) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-card modal-card-sm" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <div className="delete-modal-content">
          <div className="delete-icon-wrap">
            <AlertTriangle size={32} />
          </div>
          <h3 className="delete-modal-title">Delete Task?</h3>
          <p className="delete-modal-desc">
            Are you sure you want to permanently delete <strong>"{todo.title}"</strong>? This action cannot be undone.
          </p>
          <div className="delete-modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                onConfirm(todo.id);
                onClose();
              }}
            >
              Delete Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
