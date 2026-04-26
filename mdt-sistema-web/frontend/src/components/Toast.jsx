import { useEffect } from 'react';
import './Toast.css';

const Toast = ({ message, type = 'info', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  return (
    <div className={`toast toast-${type} toast-enter`}>
      <div className="toast-icon">{icons[type]}</div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={onClose}>✕</button>
    </div>
  );
};

export default Toast;
