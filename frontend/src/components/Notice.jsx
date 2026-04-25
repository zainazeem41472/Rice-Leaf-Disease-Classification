import React, { useEffect } from 'react';

const styles = {
  success: 'bg-green-100 text-green-800 border border-green-300',
  error: 'bg-red-100 text-red-800 border border-red-300',
  info: 'bg-blue-100 text-blue-800 border border-blue-300',
  warning: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
};

const Notice = ({ type = 'info', message, onClose, autoHideMs = 3000 }) => {
  useEffect(() => {
    if (!autoHideMs) return;
    const t = setTimeout(() => onClose?.(), autoHideMs);
    return () => clearTimeout(t);
  }, [autoHideMs, onClose]);

  if (!message) return null;

  return (
    <div className={`${styles[type] || styles.info} rounded-md px-4 py-3 flex items-center justify-between`}>
      <span className="text-sm font-medium">{message}</span>
      {onClose && (
        <button
          aria-label="Close"
          className="ml-4 text-xs underline"
          onClick={onClose}
        >
          Dismiss
        </button>
      )}
    </div>
  );
};

export default Notice;