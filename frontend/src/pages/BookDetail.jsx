import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ArrowLeft, BookOpen, Tag, Users, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const BookDetail = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/books/${bookId}`)
      .then(res => res.json())
      .then(data => {
        setBook(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    fetch(`/api/books/${bookId}/discussions`)
      .then(res => res.json())
      .then(data => setDiscussions(data))
      .catch(err => console.error(err));
  }, [bookId]);

  if (loading) return (
    <div className="loading-container" style={{ padding: '8rem 5%', textAlign: 'center' }}>
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        style={{ display: 'inline-block' }}
      >
        <BookOpen size={48} color="var(--primary)" />
      </motion.div>
      <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Завантаження книги...</p>
    </div>
  );

  if (!book) return (
    <div style={{ padding: '8rem 5%', textAlign: 'center' }}>
      <h2>Книгу не знайдено</h2>
      <button className="btn-primary" onClick={() => navigate('/discover')}>Назад до пошуку</button>
    </div>
  );

  return (
    <div className="book-detail-page" style={{ padding: '6rem 5% 4rem' }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ 
          background: 'none', 
          border: 'none', 
          color: 'var(--text-muted)', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          cursor: 'pointer',
          marginBottom: '2rem'
        }}
      >
        <ArrowLeft size={20} /> Назад
      </button>

      <div className="book-detail-layout" style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 2fr', 
        gap: '4rem',
        alignItems: 'start'
      }}>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="book-cover-large glass"
          style={{ 
            aspectRatio: '2/3', 
            overflow: 'hidden',
            borderRadius: '24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }}
        >
          {book.cover_url ? (
            <img 
              src={book.cover_url} 
              alt={book.title} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1543005139-059c1fb2a743?q=80&w=800'}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--glass-bg)' }}>
              <Book size={48} color="var(--text-muted)" />
            </div>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="book-content"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', marginBottom: '1rem' }}>
            <Star size={20} fill="currentColor" />
            <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>{book.rating?.toFixed(1)}</span>
          </div>
          
          <h1 style={{ fontSize: '3.5rem', marginBottom: '0.5rem', lineHeight: 1.1 }}>{book.title}</h1>
          <p style={{ fontSize: '1.5rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>від {book.author}</p>

          <div className="book-meta" style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div className="meta-badge glass" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Tag size={16} /> <span>{book.category || 'Література'}</span>
            </div>
            {book.isbn && (
              <div className="meta-badge glass" style={{ padding: '0.5rem 1rem', color: 'var(--text-muted)' }}>
                ISBN: {book.isbn}
              </div>
            )}
          </div>

          <div className="book-description glass" style={{ padding: '2rem', marginBottom: '3rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Про книгу</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>{book.description}</p>
          </div>

          <div className="book-actions" style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
              Додати до списку
            </button>
            <button className="btn-primary" style={{ 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid var(--glass-border)',
              padding: '1rem 2.5rem',
              fontSize: '1.1rem'
            }}>
              Знайти клуб
            </button>
          </div>
        </motion.div>
      </div>

      {discussions.length > 0 && (
        <div style={{ marginTop: '4rem' }}>
          <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Users className="accent" size={28} /> Обговорення цієї книги
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {discussions.map(disc => (
              <div key={disc.id} className="glass" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{disc.topic}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Клуб #{disc.club_id}
                  </span>
                  <button onClick={() => navigate(`/clubs/${disc.club_id}`)} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                    Перейти
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetail;
