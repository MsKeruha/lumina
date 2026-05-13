import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CustomSelect = ({ value, onChange, options, placeholder = 'Виберіть...', style = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Закрывать выпадающий список при клике вне его области
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div ref={containerRef} style={{ position: 'relative', userSelect: 'none', width: '100%', ...style }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="glass"
        style={{
          padding: '0.85rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          border: isOpen ? '1px solid var(--accent)' : '1px solid var(--glass-border)',
          borderRadius: '12px',
          color: selectedOption ? '#fff' : 'var(--text-muted)',
          fontSize: '0.95rem',
          transition: 'all 0.2s ease',
          background: 'rgba(255,255,255,0.03)'
        }}
      >
        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          size={18} 
          style={{ 
            color: 'var(--text-muted)', 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
            marginLeft: '10px',
            flexShrink: 0
          }} 
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              width: '100%',
              background: 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(20px) saturate(190%)',
              WebkitBackdropFilter: 'blur(20px) saturate(190%)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)',
              zIndex: 9999,
              overflow: 'hidden',
              padding: '6px'
            }}
          >
            <div style={{ maxHeight: '240px', overflowY: 'auto', scrollbarWidth: 'thin' }}>
              {options.length > 0 ? (
                options.map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    style={{
                      padding: '0.75rem 1rem',
                      cursor: 'pointer',
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                      color: opt.value === value ? 'white' : '#cbd5e1',
                      background: opt.value === value ? 'var(--gradient-primary)' : 'transparent',
                      transition: 'all 0.15s ease',
                      marginBottom: '2px',
                      fontWeight: opt.value === value ? '600' : 'normal'
                    }}
                    onMouseEnter={(e) => {
                      if (opt.value !== value) e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    }}
                    onMouseLeave={(e) => {
                      if (opt.value !== value) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {opt.label}
                  </div>
                ))
              ) : (
                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Немає варіантів
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomSelect;
