import { useState, useImperativeHandle, forwardRef } from 'react';
import './style.scss';

export interface ToastRef {
  add: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

const Toast = forwardRef<ToastRef>((_, ref) => {
  const [toasts, setToasts] = useState<{id: number, message: string, type: string}[]>([]);

  useImperativeHandle(ref, () => ({
    add: (message: string, type = 'info') => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 3000);
    }
  }));

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast-item ${toast.type}`}>
          <div className="toast-icon">
            {toast.type === 'success' && '✔'}
            {toast.type === 'warning' && '⚠'}
            {toast.type === 'error' && '✖'}
            {toast.type === 'info' && 'ℹ'}
          </div>
          <div className="toast-message">{toast.message}</div>
          <div className="toast-progress"></div>
        </div>
      ))}
    </div>
  );
});

export default Toast;
