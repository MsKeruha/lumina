import React from 'react';
import { Star, Book as BookIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const BookCard = ({ book }) => {
  const navigate = useNavigate();
  
  return (
    <motion.div 
      className="book-card glass"
      whileHover={{ y: -10, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      onClick={() => navigate(`/books/${book.id}`)}
      style={{ cursor: 'pointer' }}
    >
      <div className="book-cover-wrapper">
        {book.cover_url ? (
          <img src={book.cover_url} alt={book.title} className="book-cover" onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1543005139-059c1fb2a743?q=80&w=400'} />
        ) : (
          <div className="book-cover-placeholder" style={{ 
            height: '100%', 
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            textAlign: 'center',
            gap: '1rem'
          }}>
            <BookIcon size={48} color="var(--primary)" opacity={0.5} />
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{book.title}</span>
          </div>
        )}
        <div className="book-rating">
          <Star size={14} fill="currentColor" />
          <span>{book.rating?.toFixed(1) || '4.5'}</span>
        </div>
      </div>
      <div className="book-info">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">{book.author}</p>
      </div>
    </motion.div>
  );
};

export default BookCard;
