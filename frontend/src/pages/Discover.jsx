import React, { useState, useEffect } from 'react';
import { Search, Filter, Sparkles } from 'lucide-react';
import BookCard from '../components/BookCard';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';

import CustomSelect from '../components/CustomSelect';

const Discover = () => {
  const [searchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) {
      setSearch(q);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/books?q=${search}${category ? `&cat=${category}` : ''}`);
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
        <CustomSelect 
          value={category}
          onChange={setCategory}
          options={[
            { value: '', label: '📂 Всі категорії' },
            { value: 'Класика', label: '📚 Класика' },
            { value: 'Фантастика', label: '👾 Фантастика' },
            { value: 'Філософія', label: '🧠 Філософія' },
            { value: 'Детектив', label: '🔍 Детектив' }
          ]}
          style={{ width: '240px' }}
        />
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
