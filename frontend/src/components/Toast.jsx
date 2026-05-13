import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getColors = () => {
    switch (type) {
      case 'success':
        return { bg: 'rgba(16, 185, 129, 0.2)', border: 'rgba(16, 185, 129, 0.4)', icon: <CheckCircle color="#10b981" size={20} /> };
      case 'error':
        return { bg: 'rgba(239, 68, 68, 0.2)', border: 'rgba(239, 68, 68, 0.4)', icon: <AlertCircle color="#ef4444" size={20} /> };
      default:
        return { bg: 'rgba(59, 130, 246, 0.2)', border: 'rgba(59, 130, 246, 0.4)', icon: <Info color="#3b82f6" size={20} /> };
    }
  };

  const styles = getColors();

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          style={{
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            zIndex: 10000,
            transform: 'translateX(-50%)',
            background: 'rgba(20, 20, 30, 0.8)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${styles.border}`,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            borderRadius: '12px',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: 'white',
            minWidth: '300px',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {styles.icon}
            <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{message}</span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              display: 'flex',
              padding: '0.25rem',
              borderRadius: '50%'
            }}
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
