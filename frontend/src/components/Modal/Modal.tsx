import React from 'react';

interface ModalProps {
  title:    string;
  onClose:  () => void;
  onSave:   () => void;
  saving?:  boolean;
  saveLabel?: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  title, onClose, onSave, saving, saveLabel = 'Save', children,
}) => (
  <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="modal-box">
      <div className="modal-header">
        <h3>{title}</h3>
        <button className="modal-close" onClick={onClose}>×</button>
      </div>
      <div className="modal-body">{children}</div>
      <div className="modal-footer">
        <button className="btn-primary" style={{ flex: 1 }} onClick={onSave} disabled={saving}>
          {saving ? 'Saving...' : saveLabel}
        </button>
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
      </div>
    </div>
  </div>
);

export default Modal;