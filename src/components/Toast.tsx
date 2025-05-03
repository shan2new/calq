import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type, 
  onClose, 
  duration = 3000 
}) => {
  // Auto close the toast after duration
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [onClose, duration]);
  
  // Determine icon based on toast type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };
  
  // Determine toast colors based on type
  const getToastClasses = () => {
    switch (type) {
      case 'success':
        return 'border-green-100 bg-green-50 dark:bg-green-900/20 dark:border-green-900/30';
      case 'error':
        return 'border-red-100 bg-red-50 dark:bg-red-900/20 dark:border-red-900/30';
      case 'info':
        return 'border-blue-100 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-900/30';
      default:
        return 'border-gray-100 bg-gray-50 dark:bg-gray-900/20 dark:border-gray-900/30';
    }
  };
  
  return (
    <div 
      className={`fixed top-6 left-1/2 transform -translate-x-1/2 py-2 px-4 rounded-md shadow-md flex items-center gap-2 z-50 border ${getToastClasses()} animate-slide-down`}
      role="alert"
    >
      {getIcon()}
      <p className="text-sm font-medium">{message}</p>
      <button 
        onClick={onClose} 
        className="ml-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast; 