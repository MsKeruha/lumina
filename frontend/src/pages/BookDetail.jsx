import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ArrowLeft, BookOpen, Tag, Users, Calendar, BookMarked, Check, Book, ShoppingBag, ExternalLink, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';



const BookDetail = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showStatus, setShowStatus] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    // Scroll to top when opening a new book from recommendations
    window.scrollTo(0, 0);
    setLoading(true);

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

    fetch(`/api/books/${bookId}/recommendations`)
      .then(res => res.json())
      .then(data => setRecommendations(data))
      .catch(err => console.error(err));
  }, [bookId]);

  const handleAddToDiary = async (status) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/users/me/diary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ book_id: parseInt(bookId), status })
      });
      if (res.ok) {
        setSaveMsg('Книгу успішно додано!');
        setShowStatus(false);
        setTimeout(() => setSaveMsg(''), 3000);
      } else {
        setSaveMsg('Помилка збереження.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFindClubs = () => {
    navigate('/clubs'); // Redirect to club list
  };


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

          <div className="book-actions" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setShowStatus(!showStatus)} className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookMarked size={20} /> Додати до списку
              </button>
              <button onClick={handleFindClubs} className="btn-primary" style={{ 
                background: 'rgba(255,255,255,0.05)', 
                border: '1px solid var(--glass-border)',
                padding: '1rem 2.5rem',
                fontSize: '1.1rem'
              }}>
                Знайти клуб
              </button>
            </div>
            
            {showStatus && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass"
                style={{ display: 'flex', gap: '0.5rem', padding: '1rem', borderRadius: '16px', width: 'fit-content' }}
              >
                <button onClick={() => handleAddToDiary('reading')} style={{ background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.5)', color: 'white', padding: '0.5rem 1rem', borderRadius: '10px', cursor: 'pointer' }}>Читаю</button>
                <button onClick={() => handleAddToDiary('completed')} style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.5)', color: 'white', padding: '0.5rem 1rem', borderRadius: '10px', cursor: 'pointer' }}>Прочитано</button>
                <button onClick={() => handleAddToDiary('planned')} style={{ background: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.5)', color: 'white', padding: '0.5rem 1rem', borderRadius: '10px', cursor: 'pointer' }}>Планую</button>
              </motion.div>
            )}
            
            {saveMsg && (
              <div style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
                <Check size={18} /> {saveMsg}
              </div>
            )}

            {/* Affiliate Storefront Hooks */}
            <div className="glass" style={{ padding: '1.5rem', marginTop: '2rem', borderRadius: '20px', background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)' }}>
              <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                <ShoppingBag size={18} className="accent" /> Придбати друковане видання
              </h4>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <a 
                  href={`https://www.yakaboo.ua/ua/search/?q=${encodeURIComponent(book.title + ' ' + book.author)}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  style={{ 
                    flex: 1,
                    background: 'rgba(37, 99, 235, 0.15)', 
                    border: '1px solid rgba(37, 99, 235, 0.3)',
                    color: '#60a5fa',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(37, 99, 235, 0.25)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(37, 99, 235, 0.15)'}
                >
                  Yakaboo <ExternalLink size={14} />
                </a>
                
                <a 
                  href={`https://ksd.ua/search/text=${encodeURIComponent(book.title + ' ' + book.author)}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  style={{ 
                    flex: 1,
                    background: 'rgba(220, 38, 38, 0.15)', 
                    border: '1px solid rgba(220, 38, 38, 0.3)',
                    color: '#f87171',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(220, 38, 38, 0.25)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(220, 38, 38, 0.15)'}
                >
                  КСД (Клуб) <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>

        </motion.div>
      </div>

      {discussions.length > 0 && (
        <div style={{ marginTop: '5rem' }}>
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

      {/* Algorithmic Recommendations Slider */}
      {recommendations.length > 0 && (
        <div style={{ marginTop: '5rem' }}>
          <h2 style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <BookOpen className="accent" size={28} /> Схожі видання для Вас
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
            gap: '2rem' 
          }}>
            {recommendations.map(rec => (
              <motion.div 
                key={rec.id}
                whileHover={{ y: -10 }}
                onClick={() => navigate(`/books/${rec.id}`)}
                className="glass"
                style={{ 
                  padding: '1rem', 
                  borderRadius: '20px', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  flexDirection: 'column' 
                }}
              >
                <div style={{ 
                  position: 'relative', 
                  aspectRatio: '2/3', 
                  borderRadius: '14px', 
                  overflow: 'hidden', 
                  marginBottom: '1rem',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.3)' 
                }}>
                  <img 
                    src={rec.cover_url} 
                    alt={rec.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1543005139-059c1fb2a743?q=80&w=800'}
                  />
                  <div style={{ 
                    position: 'absolute', 
                    top: '0.5rem', 
                    right: '0.5rem', 
                    background: 'rgba(0,0,0,0.75)', 
                    padding: '0.3rem 0.6rem', 
                    borderRadius: '8px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.25rem', 
                    fontSize: '0.75rem', 
                    fontWeight: 'bold',
                    backdropFilter: 'blur(6px)' 
                  }}>
                    <Star size={12} fill="var(--accent)" color="var(--accent)" />
                    <span>{rec.rating?.toFixed(1)}</span>
                  </div>
                </div>
                <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '600' }}>{rec.title}</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{rec.author}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
      {/* Login Required Modal */}
      <Modal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="Вхід обов'язковий"
        footer={
          <>
            <button 
              onClick={() => setShowLoginModal(false)}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '12px', cursor: 'pointer' }}
            >
              Скасувати
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="btn-primary"
            >
              Увійти до кабінету
            </button>
          </>
        }
      >
        <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.6' }}>
          Ведення літературного щоденника, додавання книг у списки читання та перегляд статистики доступні тільки для зареєстрованих читачів Lumina Club.
        </p>
      </Modal>
    </div>

  );
};

export default BookDetail;
