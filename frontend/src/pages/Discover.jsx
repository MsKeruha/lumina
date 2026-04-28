import React, { useState, useEffect } from 'react';
import { Search, Filter, Sparkles } from 'lucide-react';
import BookCard from '../components/BookCard';
import { motion } from 'framer-motion';

const Discover = () => {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/books?q=${search}${category ? `&cat=${category}` : ''}`);
        const data = await res.json();
        setBooks(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchBooks, 300);
    return () => clearTimeout(timeoutId);
  }, [search, category]);

  return (
    <div className="content-section">
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Досліджуйте Світ Книг</h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          Знайдіть свою наступну улюблену історію серед тисяч кураторських видань.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Пошук за назвою або автором..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              width: '100%', 
              background: 'var(--glass-bg)', 
              border: '1px solid var(--glass-border)', 
              borderRadius: '16px', 
              padding: '1rem 1rem 1rem 3.5rem', 
              color: 'white',
              fontSize: '1.1rem',
              outline: 'none'
            }} 
          />
        </div>
        <select 
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="glass"
          style={{ 
            padding: '0 1.5rem', 
            background: 'rgba(255,255,255,0.05)', 
            border: '1px solid var(--glass-border)',
            borderRadius: '16px',
            color: 'white',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="" style={{ color: 'black' }}>Всі категорії</option>
          <option value="Класика" style={{ color: 'black' }}>Класика</option>
          <option value="Фантастика" style={{ color: 'black' }}>Фантастика</option>
          <option value="Філософія" style={{ color: 'black' }}>Філософія</option>
          <option value="Детектив" style={{ color: 'black' }}>Детектив</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Завантаження...</div>
      ) : (
        <motion.div 
          className="book-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {books.length > 0 ? (
            books.map(book => <BookCard key={book.id} book={book} />)
          ) : (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }}>
              <Sparkles size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <h3>Нічого не знайдено</h3>
              <p style={{ color: 'var(--text-muted)' }}>Спробуйте інший запит</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Discover;
